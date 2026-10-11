export type MockImplementation<T, Args extends any[] = []> = T | ((...args: Args) => T);

/**
 * Formats mock implementation.
 * @param impl - mock implementation.
 */
export function formatImplementation<T, Args extends any[] = []>(
  impl: MockImplementation<T, Args>,
): (...args: Args) => T {
  return typeof impl === 'function'
    ? impl as any
    : () => impl;
}
