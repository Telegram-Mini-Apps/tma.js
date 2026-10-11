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
   * @param key - a state key to use as a source.
   */
  getter<K extends keyof S>(key: K): Computed<S[K]> {
    return computed(() => this._state()[key]);
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
