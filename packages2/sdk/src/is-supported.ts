import { type Result, throwing } from '@tma.js/bridge';

export type WithIsSupported<F> = F & {
  /**
   * @returns True if the function can be called in the current environment: the SDK is
   * initialized and the Telegram client supports everything the function relies on.
   */
  isSupported: () => boolean;
};

/**
 * Adds the `isSupported` method to the function.
 * @param fn - function to extend.
 * @param isSupported - function checking if `fn` can be called.
 * @internal
 */
export function withIsSupported<F extends (...args: any[]) => any>(
  fn: F,
  isSupported: () => boolean,
): WithIsSupported<F> {
  return Object.assign(fn, { isSupported });
}

/**
 * Creates a throwing version of a function returning a result, keeping its `isSupported`
 * method. See `throwing` for details.
 * @param fn - function returning a result, or a promise of it.
 * @internal
 */
export function throwingWithIsSupported<A extends unknown[], E extends Error, T>(
  fn: WithIsSupported<(...args: A) => Promise<Result<E, T>>>,
): WithIsSupported<(...args: A) => Promise<T>>;
export function throwingWithIsSupported<A extends unknown[], E extends Error, T>(
  fn: WithIsSupported<(...args: A) => Result<E, T>>,
): WithIsSupported<(...args: A) => T>;
export function throwingWithIsSupported(
  fn: WithIsSupported<(...args: any[]) => any>,
): WithIsSupported<(...args: any[]) => any> {
  return withIsSupported(throwing(fn), fn.isSupported);
}
