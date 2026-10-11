import { camelToSnake, type CamelToSnakeCase } from '@/casing/camelToSnake.js';

export type ConvertCamelKeysToSnakeCase<T> = {
  [K in keyof T as CamelToSnakeCase<string & K>]: T[K];
};

/**
 * Converts object keys from snake to camel case.
 * @param value - value to convert.
 */
export function camelToSnakeObjKeys<T extends object>(value: T): ConvertCamelKeysToSnakeCase<T> {
  return Object.entries(value).reduce<ConvertCamelKeysToSnakeCase<T>>((acc, [k, v]) => {
    acc[camelToSnake(k) as keyof ConvertCamelKeysToSnakeCase<T>] = v;
    return acc;
  }, {} as ConvertCamelKeysToSnakeCase<T>);
}
