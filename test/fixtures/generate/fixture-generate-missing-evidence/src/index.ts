export const FLAG = true as const;

export function toggle(value: boolean): boolean {
  return !value;
}
