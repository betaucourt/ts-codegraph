/** An application error. */
export class AppError {
  constructor(public readonly code: string) {}
}

/** Create a widget instance. */
export function createWidget(): number {
  return 1;
}

/** A minimal HTTP client contract. */
export interface HttpClient {
  get(url: string): void;
}

/** The supported render modes. */
export type RenderMode = 'fast' | 'slow';

/** The API version tag. */
export const VERSION = '1' as const;
