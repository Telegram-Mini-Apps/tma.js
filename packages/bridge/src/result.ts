/**
 * Result of an operation which can fail with one of the known errors. Unlike a thrown error,
 * the error type here is checked by the compiler.
 */
export type Result<E, T> = { error: E; ok: false } | { data: T; ok: true };

/**
 * @returns A successful result.
 * @param data - result data.
 */
export function ok<T>(data: T): { data: T; ok: true } {
  return { data, ok: true };
}

/**
 * @returns A failed result.
 * @param error - result error.
 */
export function err<E>(error: E): { error: E; ok: false } {
  return { error, ok: false };
}

/**
 * @returns Result data.
 * @param result - result to unwrap.
 * @throws The result error, if the result is failed.
 */
export function unwrap<E extends Error, T>(result: Result<E, T>): T {
  if (!result.ok) {
    throw result.error;
  }
  return result.data;
}

/**
 * Creates a throwing version of a function returning a result. The created function accepts
 * the same arguments and returns the result data, or throws the result error.
 *
 * Generic functions lose their type parameters when wrapped, so write their throwing versions
 * manually using `unwrap`.
 * @param fn - function returning a result, or a promise of it.
 * @example
 * export const createStartParam = throwing(safeCreateStartParam);
 */
export function throwing<A extends unknown[], E extends Error, T>(
  fn: (...args: A) => Promise<Result<E, T>>,
): (...args: A) => Promise<T>;
export function throwing<A extends unknown[], E extends Error, T>(
  fn: (...args: A) => Result<E, T>,
): (...args: A) => T;
export function throwing(
  fn: (...args: unknown[]) => Result<Error, unknown> | Promise<Result<Error, unknown>>,
): (...args: unknown[]) => unknown {
  return (...args) => {
    const result = fn(...args);
    return result instanceof Promise ? result.then(unwrap) : unwrap(result);
  };
}
