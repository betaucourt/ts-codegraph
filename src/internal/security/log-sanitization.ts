const CRLF_PATTERN = /[\r\n]/g;
const CONTROL_CHAR_PATTERN = /[\x00-\x1F\x7F]/g;
const MAX_LOG_VALUE_LEN = 1000;
const MAX_DIAGNOSTIC_LEN = 500;

const SENSITIVE_HEADER_NAMES = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
  'x-csrf-token',
  'proxy-authorization',
  'www-authenticate',
]);

export function sanitizeLogValue(value: string): string {
  let result = value.replace(CRLF_PATTERN, ' ').replace(CONTROL_CHAR_PATTERN, '');
  if (result.length > MAX_LOG_VALUE_LEN) {
    result = result.slice(0, MAX_LOG_VALUE_LEN) + '[TRUNCATED]';
  }
  return result;
}

export function sanitizeHeaderValue(
  headerName: string,
  headerValue: string,
): string {
  if (SENSITIVE_HEADER_NAMES.has(headerName.toLowerCase())) {
    return '[REDACTED]';
  }
  return sanitizeLogValue(headerValue);
}

export function sanitizeDiagnosticText(text: string): string {
  let result = text.replace(CRLF_PATTERN, ' ').replace(CONTROL_CHAR_PATTERN, '');
  if (result.length > MAX_DIAGNOSTIC_LEN) {
    result = result.slice(0, MAX_DIAGNOSTIC_LEN) + '[TRUNCATED]';
  }
  return result;
}
