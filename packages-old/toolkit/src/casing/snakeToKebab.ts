/**
 * Converts string value from snake case to kebab case.
 * @param value - value to convert.
 */
export function snakeToKebab(value: string): string {
  return value.replace(/_([a-z])/g, (_, letter) => `-${letter.toLowerCase()}`);
}
