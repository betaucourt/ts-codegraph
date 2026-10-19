export type { SecurityPolicyDecision } from './types.js';

export {
  createSafePathPolicy,
  resolveSafePath,
  assertSafePath,
  isPathInside,
} from './path.js';
export type { SafePathPolicy, SafePathResult } from './path.js';

export {
  createOutboundUrlPolicy,
  validateOutboundUrl,
  assertOutboundUrlAllowed,
} from './url.js';
export type { OutboundUrlPolicy, OutboundUrlResult } from './url.js';

export { createRedactor, redactValue, redactObject } from './redaction.js';
export type { RedactionRule, RedactionResult, Redactor } from './redaction.js';

export {
  sanitizeLogValue,
  sanitizeHeaderValue,
  sanitizeDiagnosticText,
} from './log-sanitization.js';

export { projectAllowedKeys } from './serialization.js';

export { createRateLimitKey } from './rate-limit.js';
export type { RateLimitKeyOptions } from './rate-limit.js';

export { createSecurityAuditEvent } from './audit.js';
export type { SecurityAuditEvent, SecurityAuditEventKind } from './audit.js';

export {
  ERROR_CODES,
  ENTITY_IDS,
  TELEMETRY_ATTRIBUTES,
} from './generated/security-entities.js';
export type {
  ErrorCode as SecurityErrorCode,
  EntityId,
  AttributeName,
} from './generated/security-entities.js';
