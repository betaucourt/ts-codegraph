import { createHash } from 'node:crypto';

export interface RateLimitKeyOptions {
  readonly namespace: string;
  readonly subject: string;
  readonly action?: string;
}

export function createRateLimitKey(opts: RateLimitKeyOptions): string {
  const { namespace, subject, action } = opts;
  const subjectHash = createHash('sha256')
    .update(subject)
    .digest('hex')
    .slice(0, 16);
  const actionPart = action !== undefined ? `:${action}` : '';
  return `${namespace}:${subjectHash}${actionPart}`;
}
