import {
  computed,
  type Computed,
  type Signal,
  signal,
  type SignalOptions,
} from '@tma.js/signals';

export type SignalsTuple<T> = [Signal<T>, Computed<T>];

const signals: (Signal<any> | Computed<any>)[] = [];

/**
 * Creates a new signal with the initial value.
 * @param initialValue - the initial value.
 * @param options - additional options.
 */
export function createSignal<T>(
  initialValue: T,
  options?: SignalOptions<T>,
): Signal<T>;

/**
 * Creates a new signal without the initial value.
 * @param initialValue - the initial value.
 * @param options - additional options.
 */
export function createSignal<T>(
  initialValue?: T,
  options?: SignalOptions<T | undefined>,
): Signal<T | undefined>;

// #__NO_SIDE_EFFECTS__
export function createSignal<T>(
  initialValue?: T,
  options?: SignalOptions<T | undefined>,
): Signal<T | undefined> {
  const s = signal(initialValue, options);
  signals.push(s);
  return s;
}

/**
 * Creates a signal, which wil be automatically updated if some of its dependant signals were
 * modified.
 * @param fn - computation function.
 * @param options - additional functions.
 */
// #__NO_SIDE_EFFECTS__
export function createComputed<T>(fn: (prev?: T) => T, options?: SignalOptions<T>): Computed<T> {
  const s = computed(fn, options);
  signals.push(s);
  return s;
}

/**
 * Resets all signals states.
 */
export function resetSignals() {
  signals.forEach(s => {
    s.unsubAll();
    'reset' in s && s.reset();
  });
}

/**
 * @returns A tuple, containing a manual and computed signals. The computed signal is based on
 * the manual one.
 * @param initialValue - the initial value.
 * @param options - additional options.
 */
export function createSignalsTuple<T>(
  initialValue: T,
  options?: SignalOptions<T>,
): SignalsTuple<T>;

/**
 * @returns A tuple, containing a manual and computed signals. The computed signal is based on
 * the manual one.
 * @param initialValue - an initial value.
 * @param options - additional options.
 */
export function createSignalsTuple<T>(
  initialValue?: T,
  options?: SignalOptions<T | undefined>,
): SignalsTuple<T | undefined>;

// #__NO_SIDE_EFFECTS__
export function createSignalsTuple<T>(
  initialValue?: T,
  options?: SignalOptions<T | undefined>,
): SignalsTuple<T | undefined> {
  const s = createSignal(initialValue, options);
  return [s, createComputed(s)];
}
