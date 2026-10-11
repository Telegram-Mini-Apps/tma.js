export type SnakeToCamelCase<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<SnakeToCamelCase<Tail>>}`
    : S;

/**
 * Converts string value from snake case to camel case.
 * @param value - value to convert.
 */
export function snakeToCamel<T extends string>(value: T): SnakeToCamelCase<T> {
  return value.replace(/_[a-z]/g, m => m[1].toUpperCase()) as SnakeToCamelCase<T>;
}
