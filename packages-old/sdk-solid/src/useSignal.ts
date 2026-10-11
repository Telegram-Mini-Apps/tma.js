import { type Accessor, createSignal, onCleanup } from 'solid-js';

/**
 * Returns the underlying signal value updating it each time the signal value changes.
 * @param signal - a signal.
 */
export function useSignal<T>(signal: {
  (): T;
  sub(fn: (v: T) => void): VoidFunction;
}): Accessor<T> {
  const [get, set] = createSignal<T>(signal());
  onCleanup(signal.sub(set));
  return get;
}
