import { AppError } from '../errors/index.js';
import type { SecurityPolicyDecision } from './types.js';
import { ERROR_CODES } from './generated/security-entities.js';

export interface OutboundUrlPolicy {
  readonly allowedSchemes: readonly string[];
  readonly allowedHosts?: readonly string[];
  readonly allowPrivate: boolean;
  readonly allowRedirects: boolean;
}

export interface OutboundUrlResult {
  readonly decision: SecurityPolicyDecision;
  readonly safeHost?: string;
  readonly reason?: string;
}

const DEFAULT_SCHEMES: readonly string[] = ['http', 'https'];

const PRIVATE_HOST_PATTERNS: readonly RegExp[] = [
  /^localhost$/i,
  /^0\.0\.0\.0$/,
  /^127\.\d+\.\d+\.\d+$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/,
  /^\[::1\]$/i,
  /^\[::\]$/i,
  /^\[::ffff:[0-9a-f:]+\]$/i,
  /^\[fe80[0-9a-f:%]*\]$/i,
  /^\[f[cd][0-9a-f]{2}[0-9a-f:]*\]$/i,
  /^\[ff[0-9a-f]{2}[0-9a-f:]*\]$/i,
  /^22[4-9]\.\d+\.\d+\.\d+$/,
  /^23\d\.\d+\.\d+\.\d+$/,
];

const METADATA_HOSTS: readonly string[] = [
  '169.254.169.254',
  'metadata.google.internal',
];

function isPrivateHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  for (const pattern of PRIVATE_HOST_PATTERNS) {
    if (pattern.test(h)) return true;
  }
  for (const m of METADATA_HOSTS) {
    if (h === m) return true;
  }
  return false;
}

export function createOutboundUrlPolicy(
  opts?: Partial<OutboundUrlPolicy>,
): OutboundUrlPolicy {
  return {
    allowedSchemes: opts?.allowedSchemes ?? DEFAULT_SCHEMES,
    allowPrivate: opts?.allowPrivate ?? false,
    allowRedirects: opts?.allowRedirects ?? false,
    ...(opts?.allowedHosts !== undefined ? { allowedHosts: opts.allowedHosts } : {}),
  };
}

export function validateOutboundUrl(
  policy: OutboundUrlPolicy,
  rawUrl: string,
): OutboundUrlResult {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { decision: 'deny', reason: 'invalid_url' };
  }

  const scheme = parsed.protocol.replace(/:$/, '');

  if (!policy.allowedSchemes.includes(scheme)) {
    return { decision: 'deny', reason: 'scheme_not_allowed' };
  }

  if (parsed.username || parsed.password) {
    return { decision: 'deny', reason: 'credentials_in_url' };
  }

  const hostname = parsed.hostname;

  // Private-host check always runs first — allowedHosts cannot override SSRF protection
  if (!policy.allowPrivate && isPrivateHost(hostname)) {
    return { decision: 'deny', reason: 'private_host_not_allowed' };
  }

  if (policy.allowedHosts !== undefined) {
    const allowed = policy.allowedHosts.some(
      (h) => hostname === h || hostname.endsWith(`.${h}`),
    );
    if (!allowed) {
      return { decision: 'deny', reason: 'host_not_in_allowlist' };
    }
    return { decision: 'allow', safeHost: `${scheme}://${hostname}` };
  }

  return { decision: 'allow', safeHost: `${scheme}://${hostname}` };
}

export function assertOutboundUrlAllowed(
  policy: OutboundUrlPolicy,
  rawUrl: string,
): string {
  const result = validateOutboundUrl(policy, rawUrl);
  if (result.decision !== 'allow' || result.safeHost === undefined) {
    const detail =
      result.reason !== undefined
        ? `URL denied: ${result.reason}`
        : 'URL is not permitted by policy';
    throw new AppError({
      code: ERROR_CODES.SECURITY_URL_DENIED,
      category: 'authz',
      title: 'Outbound URL is not allowed by policy',
      clientDetail: detail,
    });
  }
  return result.safeHost;
}
