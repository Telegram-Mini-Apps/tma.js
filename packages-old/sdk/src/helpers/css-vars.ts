/**
 * Sets CSS variable globally.
 * @param name - variable name.
 * @param value - variable value.
 */
export function setCssVar(name: string, value: string | null): void {
  document.documentElement.style.setProperty(name, value);
}

/**
 * Deletes specified CSS variable.
 * @param name - variable name.
 */
export function deleteCssVar(name: string): void {
  document.documentElement.style.removeProperty(name);
}
