import { batch, computed, signal } from '@tma.js/signals';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import { access } from '@/helpers/access.js';
import type { AsyncOptions, MaybeAccessor } from '@/types.js';

export interface AsyncMountableOptions<S, E> {
  /**
   * A function to retrieve the initial state.
   * @param options - additional options.
   */
  initialState: (options?: AsyncOptions) => TE.TaskEither<E, S>;
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

export class AsyncMountable<S extends object, E> {
  constructor({
    initialState,
    onMounted,
    restoreState,
    onUnmounted,
    isPageReload,
  }: AsyncMountableOptions<S, E>) {
    this.mount = options => {
      if (this._isMounted()) {
        return TE.right(undefined);
      }
      const restored = access(isPageReload) ? restoreState() : undefined;
      return pipe(
        restored ? TE.right(restored) : initialState(options),
        TE.map(state => {
          // The user could call mount several times in a row while the
          // component was still mounting. We should prevent calling the
          // same hooks several times in this case.
          if (!this._isMounted()) {
            batch(() => {
              this._isMounted.set(true);
              onMounted?.(state);
            });
          }
        }),
      );
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
   * @param options - additional execution options.
   */
  readonly mount: (options?: AsyncOptions) => TE.TaskEither<E, void>;

  /**
   * Unmounts the component.
   */
  readonly unmount: () => void;
}
