export type CamelToSnakeCase<T extends string> = T extends `${infer First}${infer Rest}`
  ? `${First extends Capitalize<First> ? '_' : ''}${Lowercase<First>}${CamelToSnakeCase<Rest>}`
  : T;

/**
 * Converts string value from camel case to snake case.
 * @param value - value to convert.
 */
export function camelToSnake<T extends string>(value: T): CamelToSnakeCase<T> {
  return value.replace(/[A-Z]/g, match => `_${match.toLowerCase()}`) as CamelToSnakeCase<T>;
}
