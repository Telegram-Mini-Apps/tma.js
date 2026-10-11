import { Signal } from './signal.js';

let callbacks: Map<Signal<any>, () => void> | undefined;

export function runInBatchMode(signal: Signal<any>, fn: () => void): void {
  if (callbacks) {
    callbacks.set(signal, fn);
  } else {
    fn();
  }
}

/**
 * Runs the specified function in the batch mode.
 *
 * It makes all signals' subscribers to be called only after signals changes inside the specified
 * function were applied.
 * @param fn - function to run in the batch mode.
 * @example
 * const a = signal(1);
 * const b = signal(1);
 * const c = computed(() => a() + b());
 *
 * function subscriber(value) {
 *   console.log(value);
 * }
 *
 * c.sub(subscriber);
 *
 * batch(() => {
 *   a.set(2);
 *   a.set(3);
 *   b.set(2);
 *   b.set(3);
 * });
 *
 * // Despite the fact that we called signals setters four times, the `subscriber` function will
 * // be called only once. Removing the `batch` function usage will lead to calling the `subscriber`
 * // function four times.
 */
export function batch(fn: () => void): void {
  // There could be a case when a batch is called inside other batches.
  // In this case, we should just ignore the current call.
  if (callbacks) {
    return fn();
  }
  callbacks = new Map();

  try {
    fn();
  } finally {
    callbacks.forEach(cb => cb());
    callbacks = undefined;
    // TODO: What if something went wrong in fn or its callbacks?
  }
}
