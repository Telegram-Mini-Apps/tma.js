import { type Computed, computed, type Signal, signal } from '@tma.js/signals';

import { removeUndefined } from '@/helpers/removeUndefined.js';
import { shallowEqual } from '@/helpers/shallowEqual.js';

export interface StatefulOptions<S> {
  /**
   * The initial state.
   */
  initialState: S;
  /**
   * A function to call whenever the state changes.
   * @param state - updated state.
   */
  onChange: (state: S) => void;
}

export class Stateful<S extends object> {
  constructor({ initialState, onChange }: StatefulOptions<S>) {
    this._state = signal(initialState, { equals: shallowEqual });
    this.state = computed(this._state);
    this.state.sub(onChange);
  }

  protected readonly _state: Signal<S>;

  /**
   * The current state.
   */
  readonly state: Computed<S>;

  /**
   * Creates a computed signal based on the state.
   *
   * If the underlying value is a plain object or array, a frozen shallow
   * copy is returned so consumer mutations cannot leak back into the
   * internal state. Primitives and other value types are returned as-is.
   *
   * @param key - a state key to use as a source.
   */
  getter<K extends keyof S>(key: K): Computed<S[K]> {
    return computed(() => frozenClone(this._state()[key]));
  }

  /**
   * Updates the state.
   * @param state - updates to apply.
   */
  readonly setState = (state: Partial<S>): void => {
    const nextState = { ...this.state(), ...removeUndefined(state) };
    if (!shallowEqual(nextState, this.state())) {
      this._state.set(nextState);
    }
  };

  /**
   * @returns True if specified payload will update the state.
   * @param state
   */
  hasDiff(state: Partial<S>): boolean {
    return !shallowEqual({ ...this.state(), ...removeUndefined(state) }, this.state());
  }
}

/**
 * Returns a frozen shallow copy of plain objects and arrays; primitives and
 * other value types are returned unchanged. Guards `Stateful.getter` from
 * handing out references into its internal state — the returned value is
 * frozen so a consumer cannot mutate the object it reads back on the next
 * call, and can't mutate the internal state either (spread produces a
 * separate object, freeze prevents in-place mutation of the copy).
 *
 * Freeze is used instead of "copy on every read" because `computed(...)`
 * memoises its function's output — a copy alone would be created once and
 * then handed to every subsequent read.
 */
function frozenClone<T>(value: T): T {
  if (Array.isArray(value)) return Object.freeze(value.slice()) as unknown as T;
  if (value !== null && typeof value === 'object') {
    const proto = Object.getPrototypeOf(value);
    // Only copy plain-object shapes; class instances (Maps, Sets, Dates, custom
    // classes) round-trip by reference because a spread would strip prototype.
    if (proto === null || proto === Object.prototype) {
      return Object.freeze({ ...(value as object) }) as T;
    }
  }
  return value;
}
