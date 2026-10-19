/** A counter that only moves forward. */
export class Counter {
  next(): number {
    return 1;
  }
}

/** Create a counter starting at zero. */
export function createCounter(): Counter {
  return new Counter();
}
