import type { BetterPromiseOptions } from 'better-promises';

/**
 * Async options allowed to be used in package's public functions.
 */
export type AsyncOptions = Pick<BetterPromiseOptions, 'abortSignal' | 'timeout'>;

export type MaybeAccessor<T> = T | (() => T);
