/**
 * @returns Error thrown by the function, or `undefined` if nothing was thrown.
 */
export function catchError(fn: () => unknown): unknown {
  try {
    fn();
  } catch (e) {
    return e;
  }
}
