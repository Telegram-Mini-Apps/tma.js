import type { PostEventError } from '@tma.js/bridge';
import type { Computed } from '@tma.js/signals';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

import { Mountable } from '@/composables/Mountable.js';
import { Stateful } from '@/composables/Stateful.js';
import type { SharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import type { WithPostEvent } from '@/fn-options/withPostEvent.js';
import type { WithStateRestore } from '@/fn-options/withStateRestore.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import {
  createWithChecksFp,
  type WithChecks,
  type WithChecksFp,
} from '@/with-checks/withChecksFp.js';

export interface ClosingBehaviorState {
  isConfirmationEnabled: boolean;
}

export interface ClosingBehaviorOptions
  extends WithStateRestore<ClosingBehaviorState>,
  WithPostEvent,
  SharedFeatureOptions {
}

export class ClosingBehavior {
  constructor({ postEvent, storage, isTma, isPageReload }: ClosingBehaviorOptions) {
    const stateful = new Stateful({
      initialState: { isConfirmationEnabled: false },
      onChange(state) {
        storage.set(state);
      },
    });
    const mountable = new Mountable({
      onMounted: stateful.setState,
      restoreState: storage.get,
      initialState: { isConfirmationEnabled: false },
      isPageReload,
    });

    const wrapOptions = { requires: 'web_app_setup_closing_behavior', isTma } as const;
    const wrapSupportedPlain = createWithChecksFp({
      ...wrapOptions,
      returns: 'plain',
    });
    const wrapMountedEither = createWithChecksFp({
      ...wrapOptions,
      returns: 'either',
      isMounted: mountable.isMounted,
    });

    const setClosingConfirmation = (isConfirmationEnabled: boolean) => {
      if (isConfirmationEnabled === this.isConfirmationEnabled()) {
        return E.right(undefined);
      }
      stateful.setState({ isConfirmationEnabled });
      return postEvent('web_app_setup_closing_behavior', {
        need_confirmation: isConfirmationEnabled,
      });
    };

    this.isConfirmationEnabled = stateful.getter('isConfirmationEnabled');
    this.isMounted = mountable.isMounted;

    this.disableConfirmationFp = wrapMountedEither(() => {
      return setClosingConfirmation(false);
    });
    this.enableConfirmationFp = wrapMountedEither(() => {
      return setClosingConfirmation(true);
    });
    this.mountFp = wrapSupportedPlain(() => {
      const nothing = () => undefined;
      return pipe(mountable.mount(), E.match(nothing, nothing));
    });
    this.unmount = mountable.unmount;

    this.disableConfirmation = throwifyWithChecksFp(this.disableConfirmationFp);
    this.enableConfirmation = throwifyWithChecksFp(this.enableConfirmationFp);
    this.mount = throwifyWithChecksFp(this.mountFp);
  }

  /**
   * Signal indicating if closing confirmation dialog is currently enabled.
   */
  readonly isConfirmationEnabled: Computed<boolean>;

  /**
   * Signal indicating if the component is currently mounted.
   */
  readonly isMounted: Computed<boolean>;

  /**
   * Mounts the component restoring its state.
   */
  readonly mountFp: WithChecksFp<() => void, false>;

  /**
   * @see mountFp
   */
  readonly mount: WithChecks<() => void, false>;

  /**
   * Unmounts the component.
   */
  readonly unmount: () => void;

  /**
   * Disables the closing confirmation dialog.
   */
  readonly disableConfirmationFp: WithChecksFp<() => E.Either<PostEventError, void>, false>;

  /**
   * @see disableConfirmationFp
   */
  readonly disableConfirmation: WithChecks<() => void, false>;

  /**
   * Enables the closing confirmation dialog.
   */
  readonly enableConfirmationFp: WithChecksFp<() => E.Either<PostEventError, void>, false>;

  /**
   * @see enableConfirmationFp
   */
  readonly enableConfirmation: WithChecks<() => void, false>;
}
