/**
 * Converts string value from camel case to kebab case.
 * @param value - value to convert.
 */
export function camelToKebab(value: string): string {
  return value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
}
