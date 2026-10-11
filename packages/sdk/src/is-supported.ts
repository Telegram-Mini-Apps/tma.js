import { type Result, throwing } from '@tma.js/bridge';

export interface IsSupported {
  /**
   * @returns True if the function can be called in the current environment: the SDK is
   * initialized and the Telegram client supports everything the function relies on.
   */
  isSupported: () => boolean;
}

export interface Supports<K extends string> extends IsSupported {
  /**
   * @returns True if the function can be called, and the Telegram client supports the feature.
   * @param feature - feature to check.
   */
  supports: (feature: K) => boolean;
}

export type WithIsSupported<F> = F & IsSupported;

export type WithSupports<F, K extends string> = F & Supports<K>;

type AnyFn = (...args: any[]) => any;

/**
 * Adds the `isSupported` method to the function. The function is mutated.
 * @param fn - function to extend.
 * @param isSupported - function checking if `fn` can be called.
 * @internal
 */
export function withIsSupported<F extends AnyFn>(
  fn: F,
  isSupported: () => boolean,
): WithIsSupported<F>;
/**
 * Adds the `isSupported` and `supports` methods to the function.
 * @param fn - function to extend.
 * @param isSupported - function checking if `fn` can be called.
 * @param features - feature to the function checking if it is supported.
 * @internal
 */
export function withIsSupported<F extends AnyFn, K extends string>(
  fn: F,
  isSupported: () => boolean,
  features: Record<K, () => boolean>,
): WithSupports<F, K>;
export function withIsSupported(
  fn: AnyFn,
  isSupported: () => boolean,
  features?: Record<string, () => boolean>,
): WithIsSupported<AnyFn> {
  return Object.assign(fn, features
    ? { isSupported, supports: (feature: string) => features[feature]() }
    : { isSupported });
}

/**
 * Creates a throwing version of a function returning a result, keeping its `isSupported` and
 * `supports` methods. See `throwing` for details.
 * @param fn - function returning a result, or a promise of it.
 * @internal
 */
export function throwingWithIsSupported<A extends unknown[], E extends Error, T, K extends string>(
  fn: WithSupports<(...args: A) => Promise<Result<E, T>>, K>,
): WithSupports<(...args: A) => Promise<T>, K>;
export function throwingWithIsSupported<A extends unknown[], E extends Error, T, K extends string>(
  fn: WithSupports<(...args: A) => Result<E, T>, K>,
): WithSupports<(...args: A) => T, K>;
export function throwingWithIsSupported<A extends unknown[], E extends Error, T>(
  fn: WithIsSupported<(...args: A) => Promise<Result<E, T>>>,
): WithIsSupported<(...args: A) => Promise<T>>;
export function throwingWithIsSupported<A extends unknown[], E extends Error, T>(
  fn: WithIsSupported<(...args: A) => Result<E, T>>,
): WithIsSupported<(...args: A) => T>;
export function throwingWithIsSupported(
  fn: WithIsSupported<AnyFn> & Partial<Supports<string>>,
): WithIsSupported<AnyFn> {
  const { isSupported, supports } = fn;
  return Object.assign(throwing(fn), supports ? { isSupported, supports } : { isSupported });
}
