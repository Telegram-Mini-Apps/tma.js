/**
 * Result of an operation which can fail with one of the known errors. Unlike a thrown error,
 * the error type here is checked by the compiler.
 */
export type Result<T, E> = { ok: true; data: T } | { ok: false; error: E };

/**
 * @returns A successful result.
 * @param data - result data.
 */
export function ok<T>(data: T): { ok: true; data: T } {
  return { ok: true, data };
}

/**
 * @returns A failed result.
 * @param error - result error.
 */
export function err<E>(error: E): { ok: false; error: E } {
  return { ok: false, error };
}

/**
 * @returns Result data.
 * @param result - result to unwrap.
 * @throws The result error, if the result is failed.
 */
export function unwrap<T, E extends Error>(result: Result<T, E>): T {
  if (!result.ok) {
    throw result.error;
  }
  return result.data;
}
