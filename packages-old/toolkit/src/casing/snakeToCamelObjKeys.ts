import { snakeToCamel, type SnakeToCamelCase } from '@/casing/snakeToCamel.js';

export type ConvertSnakeKeysToCamelCase<T> = {
  [K in keyof T as SnakeToCamelCase<string & K>]: T[K];
};

/**
 * Converts object keys from snake to camel case.
 * @param value - value to convert.
 */
export function snakeToCamelObjKeys<T extends object>(value: T): ConvertSnakeKeysToCamelCase<T> {
  return Object.entries(value).reduce<ConvertSnakeKeysToCamelCase<T>>((acc, [k, v]) => {
    acc[snakeToCamel(k) as keyof ConvertSnakeKeysToCamelCase<T>] = v;
    return acc;
  }, {} as ConvertSnakeKeysToCamelCase<T>);
}
