import { onDestroy } from 'svelte';
import { writable, type Writable } from 'svelte/store';

/**
 * Returns the underlying signal value updating it each time the signal value changes.
 * @param signal - a signal.
 */
export function useSignal<T>(signal: {
  (): T;
  sub(fn: (v: T) => void): VoidFunction;
}): Writable<T> {
  const _value = writable<T>(signal());
  const unsub = signal.sub(value => {
    _value.update(() => (value));
  });
  onDestroy(unsub);

  return _value;
}
