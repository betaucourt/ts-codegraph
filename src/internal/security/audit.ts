import type { SecurityPolicyDecision } from './types.js';
import { createRedactor, redactValue } from './redaction.js';

export type { SecurityPolicyDecision };

export type SecurityAuditEventKind =
  | 'path.allow'
  | 'path.deny'
  | 'url.allow'
  | 'url.deny'
  | 'redact.applied'
  | 'policy.violation'
  | 'authz.deny'
  | 'authn.failure';

export interface SecurityAuditEvent {
  readonly kind: SecurityAuditEventKind;
  readonly component: string;
  readonly timestamp: string;
  readonly decision: SecurityPolicyDecision;
  readonly reason?: string;
  readonly metadata?: Readonly<Record<string, string | number | boolean>>;
}

const CONTROL_CHAR_PATTERN = /[\x00-\x1F\x7F]/g;
const COMPONENT_MAX = 100;
const REASON_MAX = 200;
const META_VALUE_MAX = 200;
const SECRET_KEY_PATTERN =
  /password|passwd|secret|token|jwt|key|auth|credential|private|access/i;

const AUDIT_REDACTOR = createRedactor();

function scrubField(s: string, max: number): string {
  return s.replace(CONTROL_CHAR_PATTERN, ' ').slice(0, max);
}

function sanitizeString(s: string, max: number): string {
  return redactValue(AUDIT_REDACTOR, scrubField(s, max)).value;
}

function isSecretMetaKey(key: string): boolean {
  return SECRET_KEY_PATTERN.test(key);
}

export function createSecurityAuditEvent(opts: {
  kind: SecurityAuditEventKind;
  component: string;
  decision: SecurityPolicyDecision;
  reason?: string;
  metadata?: Readonly<Record<string, string | number | boolean>>;
}): SecurityAuditEvent {
  const safeMetadata: Record<string, string | number | boolean> | undefined =
    opts.metadata !== undefined
      ? Object.fromEntries(
          Object.entries(opts.metadata).map(([k, v]) => {
            if (isSecretMetaKey(k)) return [k, '[REDACTED]'];
            if (typeof v === 'string') return [k, sanitizeString(v, META_VALUE_MAX)];
            return [k, v];
          }),
        )
      : undefined;

  const event: {
    kind: SecurityAuditEventKind;
    component: string;
    timestamp: string;
    decision: SecurityPolicyDecision;
    reason?: string;
    metadata?: Readonly<Record<string, string | number | boolean>>;
  } = {
    kind: opts.kind,
    component: scrubField(opts.component, COMPONENT_MAX),
    timestamp: new Date().toISOString(),
    decision: opts.decision,
  };
  if (opts.reason !== undefined) {
    event.reason = sanitizeString(opts.reason, REASON_MAX);
  }
  if (safeMetadata !== undefined) {
    event.metadata = safeMetadata;
  }
  return event;
}
