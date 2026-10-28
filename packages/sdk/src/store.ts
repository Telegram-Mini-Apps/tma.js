import { getLogger } from '@tma.js/bridge';

/**
 * Function subscribing to changes. It is compatible with React's `useSyncExternalStore` and
 * similar APIs of other frameworks.
 * @param listener - function to call whenever something changes.
 * @returns Function removing the listener.
 */
export type SubscribeFn = (listener: VoidFunction) => VoidFunction;

/**
 * Deeply readonly version of a type. Values returned by stores are frozen, so mutating them
 * throws an error.
 */
export type DeepReadonly<T> = T extends Date | ((...args: any[]) => any)
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

/**
 * Value computed from other values. Call it to get the current value, or subscribe to its
 * changes.
 * @example
 * backButton.isVisible(); // false
 * const unsubscribe = backButton.isVisible.subscribe((next, prev) => {
 *   console.log('isVisible changed:', prev, '->', next);
 * });
 */
export interface Computed<T> {
  /**
   * @returns The current value. It is frozen, so it can't be mutated.
   */
  (): DeepReadonly<T>;
  /**
   * Subscribes to the value changes. Listeners are called only if the value has changed, which
   * is checked using `Object.is`. Unlike Svelte stores, the listener is not called on subscribe.
   * The function is compatible with React's `useSyncExternalStore` and similar APIs of other
   * frameworks.
   * @param listener - function to call with the next and the previous values.
   * @returns Function removing the listener.
   */
  subscribe: (
    listener: (next: DeepReadonly<T>, prev: DeepReadonly<T>) => void,
  ) => VoidFunction;
}

export interface Store<T> {
  /**
   * @returns The current value. The same reference is returned until the value changes. Plain
   * objects and arrays are frozen.
   */
  get: () => T;
  /**
   * Updates the value. Listeners are called only if the value has changed.
   */
  set: (value: T) => void;
  /**
   * Subscribes to the value changes. The listener is called after `set` changes the value, and
   * receives no arguments, so read the value using `get`. To track the next and the previous
   * values, use `computedFromStore` or `computedPick`.
   */
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const proto = Object.getPrototypeOf(value) as unknown;
  return proto === Object.prototype || proto === null;
}

/**
 * @returns Deeply frozen copy of the value. Only plain objects and arrays are copied and frozen,
 * frozen ones are returned as is. This way, objects passed by other code, e.g. event payloads,
 * stay mutable, and nested values keep their references when the containing object is updated.
 * @param value - value to freeze.
 * @internal
 */
export function deepFreeze<T>(value: T): T {
  if (Object.isFrozen(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    return Object.freeze(value.map(deepFreeze)) as T;
  }
  if (isPlainObject(value)) {
    const copy: Record<string, unknown> = {};
    Object.keys(value).forEach(key => {
      copy[key] = deepFreeze(value[key]);
    });
    return Object.freeze(copy) as T;
  }
  return value;
}

/**
 * Calls the listeners with the arguments. Errors thrown by listeners are logged, so they don't
 * prevent other listeners from being called.
 */
function notify<A extends unknown[]>(listeners: Set<(...args: A) => void>, ...args: A): void {
  // Copying listeners, so the ones added or removed during the call don't affect it.
  [...listeners].forEach(listener => {
    try {
      listener(...args);
    } catch (e) {
      getLogger().error('A listener threw an error:', e);
    }
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
  let value = deepFreeze(initialValue);
  const listeners = new Set<VoidFunction>();

  return {
    get: () => value,
    set(next) {
      if (equals(value, next)) {
        return;
      }
      value = deepFreeze(next);
      notify(listeners);
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

/**
 * Creates a computed value. It is subscribed to the sources only while it has listeners.
 * @param get - function computing the value. It must return the same value until it changes.
 * Objects must be taken from stores, so they are frozen.
 * @param sources - functions subscribing to changes of values the computed value depends on.
 * @internal
 */
export function computed<T>(get: () => T, ...sources: SubscribeFn[]): Computed<T> {
  const subscribe = combineSubscribe(...sources);
  const listeners = new Set<(next: T, prev: T) => void>();
  let value: T;
  let unsubscribe: VoidFunction | undefined;

  const update = () => {
    const prev = value;
    value = get();
    Object.is(prev, value) || notify(listeners, value, prev);
  };

  return Object.assign(() => get(), {
    subscribe(listener: (next: T, prev: T) => void) {
      if (!unsubscribe) {
        value = get();
        unsubscribe = subscribe(update);
      }
      // Wrapping the listener, so subscribing the same function twice creates two subscriptions,
      // and each of them is removed independently.
      const wrapped = (next: T, prev: T) => listener(next, prev);
      listeners.add(wrapped);
      return () => {
        if (listeners.delete(wrapped) && !listeners.size && unsubscribe) {
          unsubscribe();
          unsubscribe = undefined;
        }
      };
    },
  }) as Computed<T>;
}

/**
 * @returns Computed value reflecting the store value.
 * @param store - store to reflect.
 * @internal
 */
export function computedFromStore<T>(store: Store<T>): Computed<T> {
  return computed(store.get, store.subscribe);
}

/**
 * @returns Computed value reflecting the store value property.
 * @param store - store holding an object.
 * @param key - property key.
 * @internal
 */
export function computedPick<T extends object, K extends keyof T>(
  store: Store<T>,
  key: K,
): Computed<T[K]> {
  return computed(() => store.get()[key], store.subscribe);
}
