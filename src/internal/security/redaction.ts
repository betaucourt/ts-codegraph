export interface RedactionRule {
  readonly pattern: RegExp;
  readonly replacement: string;
}

export interface RedactionResult {
  readonly value: string;
  readonly redacted: boolean;
}

export interface Redactor {
  readonly rules: readonly RedactionRule[];
}

const DEFAULT_RULES: readonly RedactionRule[] = [
  {
    pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
    replacement: 'Bearer [REDACTED]',
  },
  {
    pattern: /Basic\s+[A-Za-z0-9+/]+=*/gi,
    replacement: 'Basic [REDACTED]',
  },
  {
    pattern:
      /(?:password|passwd|secret|token|jwt|api[_-]?key|apikey|private[_-]?key|access[_-]?key|auth(?:orization)?)\s*[=:]\s*\S+/gi,
    replacement: '[REDACTED]',
  },
];

export function createRedactor(
  additionalRules?: readonly RedactionRule[],
): Redactor {
  return {
    rules: [...DEFAULT_RULES, ...(additionalRules ?? [])],
  };
}

export function redactValue(redactor: Redactor, value: string): RedactionResult {
  let result = value;
  let redacted = false;
  for (const rule of redactor.rules) {
    const next = result.replace(rule.pattern, rule.replacement);
    if (next !== result) {
      redacted = true;
      result = next;
    }
  }
  return { value: result, redacted };
}

const SECRET_KEY_PATTERN =
  /password|passwd|secret|token|jwt|key|auth|credential|private|access/i;

function isSecretLikeKey(key: string): boolean {
  return SECRET_KEY_PATTERN.test(key);
}

function redactArrayItems(redactor: Redactor, arr: readonly unknown[]): unknown[] {
  return arr.map((item) => {
    if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
      return redactObject(redactor, item as Readonly<Record<string, unknown>>);
    }
    if (Array.isArray(item)) {
      return redactArrayItems(redactor, item);
    }
    if (typeof item === 'string') {
      return redactValue(redactor, item).value;
    }
    return item;
  });
}

export function redactObject(
  redactor: Redactor,
  obj: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (isSecretLikeKey(key)) {
      result[key] = '[REDACTED]';
    } else if (typeof val === 'string') {
      result[key] = redactValue(redactor, val).value;
    } else if (Array.isArray(val)) {
      result[key] = redactArrayItems(redactor, val);
    } else if (val !== null && typeof val === 'object') {
      result[key] = redactObject(redactor, val as Readonly<Record<string, unknown>>);
    } else {
      result[key] = val;
    }
  }
  return result;
}
