import type { Computed } from '@tma.js/sdk';

/**
 * Creates a computed value, which can be changed manually.
 * @param initialValue - initial value.
 */
export function createSource<T>(initialValue: T) {
  let value = initialValue;
  const listeners = new Set<(next: T, prev: T) => void>();
  const computed = Object.assign(() => value, {
    subscribe(listener: (next: T, prev: T) => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  }) as Computed<T>;
  return {
    computed,
    listeners,
    set(next: T) {
      const prev = value;
      value = next;
      listeners.forEach(listener => listener(next, prev));
    },
  };
}
