export function projectAllowedKeys<T extends Record<string, unknown>>(
  obj: Readonly<T>,
  allowedKeys: readonly string[],
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      (result as Record<string, unknown>)[key] = (obj as Record<string, unknown>)[key];
    }
  }
  return result;
}
