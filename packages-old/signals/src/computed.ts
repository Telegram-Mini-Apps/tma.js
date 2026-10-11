import { signal, type Signal, type SignalOptions } from './signal.js';

export interface Computed<T> extends Omit<Signal<T>, 'set' | 'reset'> {
  /**
   * @returns An underlying signal value.
   */
  (): T;
}

const collectContexts: Set<Signal<unknown>>[] = [];

export function collectSignal(signal: Signal<any>): void {
  collectContexts.length && collectContexts[collectContexts.length - 1].add(signal);
}

/**
 * Creates a signal, which wil be automatically updated if some of its dependant signals were
 * modified.
 * @param fn - computation function.
 * @param options - additional functions.
 */
// #__NO_SIDE_EFFECTS__
export function computed<T>(
  fn: (prev?: T) => T,
  options?: SignalOptions<T>,
): Computed<T> {
  let deps = new Set<Signal<unknown>>();

  // An underlying signal.
  let $signal: Signal<T> | undefined;

  function s(): Signal<T> {
    return $signal || ($signal = signal<T>(compute(), options));
  }

  function update() {
    s().set(compute());
  }

  function compute(): T {
    // As long as in this iteration, we may receive new signals as dependencies, we stop
    // listening to the previous signals.
    deps.forEach(s => {
      s.unsub(update, { signal: true });
    });

    // Signals we collected during current computation.
    const collectedSignals = new Set<Signal<unknown>>();
    let result: T;

    // Add this set to the global variable, so dependant signals will be catched.
    collectContexts.push(collectedSignals);

    try {
      // Run the function and collect all called signals.
      result = fn();
    } finally {
      // Remember to untrack the reactive context.
      collectContexts.pop();
    }

    // Start tracking for all dependencies' changes and re-compute the computed value.
    collectedSignals.forEach(s => {
      s.sub(update, { signal: true });
    });
    deps = collectedSignals;

    return result;
  }

  return Object.assign(function computed(): T {
    return s()();
  }, {
    destroy() {
      s().destroy();
    },
    sub(...args) {
      return s().sub(...args);
    },
    unsub(...args) {
      s().unsub(...args);
    },
    unsubAll(...args) {
      s().unsubAll(...args);
    },
  } satisfies Pick<Computed<T>, 'destroy' | 'sub' | 'unsub' | 'unsubAll'>);
}
