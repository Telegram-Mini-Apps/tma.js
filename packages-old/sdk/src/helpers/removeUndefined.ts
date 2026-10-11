import type { UnionRequiredKeys } from '@tma.js/toolkit';

type RemoveUndefined<T> = {
  [K in UnionRequiredKeys<T>]-?: T[K]
};

/**
 * @returns Object with keys having undefined values.
 * @param value - an object to remove undefined values from.
 */
export function removeUndefined<T extends {}>(value: T): RemoveUndefined<T> {
  const result = {} as RemoveUndefined<T>;
  for (const k in value) {
    const v = value[k];
    v !== undefined && ((result as any)[k] = v);
  }
  return result;
}
