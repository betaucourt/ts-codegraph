export enum SpanStatusCode {
  UNSET = 0,
  OK = 1,
  ERROR = 2,
}

export type Attributes = Record<string, string | number | boolean | undefined>;

export interface Span {
  setAttribute(key: string, value: unknown): this;
  setAttributes(attributes: Attributes): this;
  setStatus(status: { code: SpanStatusCode; message?: string }): this;
  recordException(exception: unknown): void;
  end(): void;
}

export interface Tracer {
  startSpan(name: string, options?: unknown): Span;
}

export interface Counter {
  add(value: number, attributes?: Attributes): void;
}

export interface Histogram {
  record(value: number, attributes?: Attributes): void;
}

export interface Meter {
  createCounter(name: string, options?: unknown): Counter;
  createHistogram(name: string, options?: unknown): Histogram;
}

const NOOP_SPAN: Span = {
  setAttribute() { return this; },
  setAttributes() { return this; },
  setStatus() { return this; },
  recordException() {},
  end() {},
};

const NOOP_TRACER: Tracer = {
  startSpan() { return NOOP_SPAN; },
};

const NOOP_COUNTER: Counter = {
  add() {},
};

const NOOP_HISTOGRAM: Histogram = {
  record() {},
};

const NOOP_METER: Meter = {
  createCounter() { return NOOP_COUNTER; },
  createHistogram() { return NOOP_HISTOGRAM; },
};

export function getTracer(_name?: string, _version?: string): Tracer {
  return NOOP_TRACER;
}

export function getMeter(_name?: string, _version?: string): Meter {
  return NOOP_METER;
}
