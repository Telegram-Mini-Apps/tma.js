import type { SnakeToCamelCase } from '@/casing/snakeToCamel.js';
import { snakeToCamelObjKeys } from '@/casing/snakeToCamelObjKeys.js';

export type DeepConvertSnakeKeysToCamelCase<T> = T extends infer U
  ? U extends object
    ? U extends Date
      ? U
      : U extends (infer Item)[]
        ? DeepConvertSnakeKeysToCamelCase<Item>[]
        : {
          [K in keyof U as SnakeToCamelCase<string & K>]: DeepConvertSnakeKeysToCamelCase<U[K]>
        } & {}
    : U
  : T;

/**
 * Deeply converts object keys from snake to camel case.
 * @param value - value to convert.
 */
export function deepSnakeToCamelObjKeys<T extends object>(
  value: T,
): DeepConvertSnakeKeysToCamelCase<T> {
  const camelCased = snakeToCamelObjKeys(value);
  for (const key in camelCased) {
    const value = camelCased[key];
    if (value && typeof value === 'object' && !(value instanceof Date)) {
      (camelCased as any)[key] = Array.isArray(value)
        ? value.map(deepSnakeToCamelObjKeys)
        : deepSnakeToCamelObjKeys(value);
    }
  }
  return camelCased as DeepConvertSnakeKeysToCamelCase<T>;
}
