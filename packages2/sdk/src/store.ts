import { getLogger } from '@tma.js/bridge';

/**
 * Function subscribing to changes. It is compatible with React's `useSyncExternalStore` and
 * similar APIs of other frameworks.
 * @param listener - function to call whenever something changes.
 * @returns Function removing the listener.
 */
export type SubscribeFn = (listener: VoidFunction) => VoidFunction;

export interface Store<T> {
  /**
   * @returns The current value. The same reference is returned until the value changes.
   */
  get: () => T;
  /**
   * Updates the value. Listeners are called only if the value has changed.
   */
  set: (value: T) => void;
  subscribe: SubscribeFn;
}

/**
 * @returns True if both objects have the same keys and values.
 * @internal
 */
export function shallowEqual(a: object, b: object): boolean {
  const aKeys = Object.keys(a);
  return aKeys.length === Object.keys(b).length
    && aKeys.every(key => {
      return Object.prototype.hasOwnProperty.call(b, key)
        && Object.is((a as any)[key], (b as any)[key]);
    });
}

/**
 * Creates a store holding a value and notifying listeners about its changes.
 * @param initialValue - initial value.
 * @param equals - function comparing the current and the next values.
 * @internal
 */
export function createStore<T>(
  initialValue: T,
  equals: (a: T, b: T) => boolean = Object.is,
): Store<T> {
  let value = initialValue;
  const listeners = new Set<VoidFunction>();

  return {
    get: () => value,
    set(next) {
      if (equals(value, next)) {
        return;
      }
      value = next;
      // Copying listeners, so the ones added or removed during the call don't affect it.
      [...listeners].forEach(listener => {
        try {
          listener();
        } catch (e) {
          getLogger().error('A store listener threw an error:', e);
        }
      });
    },
    subscribe(listener) {
      // Wrapping the listener, so subscribing the same function twice creates two subscriptions,
      // and each of them is removed independently.
      const wrapped = () => listener();
      listeners.add(wrapped);
      return () => {
        listeners.delete(wrapped);
      };
    },
  };
}

/**
 * Creates a store holding an object and replacing it only if some of its properties change.
 * @param initialValue - initial value.
 * @internal
 */
export function createObjectStore<T extends object>(
  initialValue: T,
): Store<T> & { update: (value: Partial<T>) => void } {
  const store = createStore(initialValue, shallowEqual);
  return {
    ...store,
    update(value) {
      store.set({ ...store.get(), ...value });
    },
  };
}

/**
 * @returns Function subscribing to changes of all the specified sources.
 * @param sources - functions subscribing to changes.
 * @internal
 */
export function combineSubscribe(...sources: SubscribeFn[]): SubscribeFn {
  return listener => {
    const unsubscribes = sources.map(subscribe => subscribe(listener));
    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  };
}
