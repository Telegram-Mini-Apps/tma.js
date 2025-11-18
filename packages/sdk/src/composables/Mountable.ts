import { batch, computed, signal } from '@tma.js/signals';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

import { access } from '@/helpers/access.js';
import type { MaybeAccessor } from '@/types.js';

export interface MountableOptions<S, Err> {
  /**
   * A state to use if the `restoreState` function returned falsy value or
   * `isPageReload` returned false.
   */
  initialState: S | (() => E.Either<Err, S>);
  /**
   * @returns True if the current page was reloaded.
   */
  isPageReload: MaybeAccessor<boolean>;
  /**
   * A function to call whenever the component was mounted.
   * @param state - restored state.
   */
  onMounted?: (state: S) => void;
  /**
   * A function to call whenever the component was unmounted.
   */
  onUnmounted?: VoidFunction;
  /**
   * Attempts to restore previously saved component state. This function
   * will only be called if the current page was reloaded.
   */
  restoreState: () => (S | undefined);
}

export class Mountable<S extends object, Err = never> {
  constructor({
    onMounted,
    restoreState,
    initialState,
    onUnmounted,
    isPageReload,
  }: MountableOptions<S, Err>) {
    this.mount = () => {
      if (this.isMounted()) {
        return E.right(undefined);
      }
      const restored = access(isPageReload) ? restoreState() : undefined;
      const state = restored
        ? E.right(restored)
        : (typeof initialState === 'function' ? initialState() : E.right(initialState));

      return pipe(state, E.map(s => {
        batch(() => {
          this._isMounted.set(true);
          onMounted?.(s);
        });
      }));
    };

    this.unmount = () => {
      if (this._isMounted()) {
        batch(() => {
          this._isMounted.set(false);
          onUnmounted?.();
        });
      }
    };
  }

  private readonly _isMounted = signal(false);

  /**
   * Signal indicating if the component is mounted.
   */
  readonly isMounted = computed(this._isMounted);

  /**
   * Mounts the component restoring its state and calling required side effects.
   */
  readonly mount: () => E.Either<Err, void>;

  /**
   * Unmounts the component.
   */
  readonly unmount: () => void;
}
