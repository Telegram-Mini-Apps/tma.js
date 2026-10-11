import { createComponentCore } from '../../component.js';
import { isMethodSupported, requireMethod } from '../../globals.js';
import { type Computed, computedFromStore, computedPick } from '../../store.js';
import type { MountableComponent, StatefulComponent } from '../../types.js';

export interface SwipeBehaviorState {
  isVerticalEnabled: boolean;
}

/**
 * Methods changing the state throw:
 * - `NotInitializedError` if the SDK is not initialized;
 * - `MethodUnsupportedError` if the component is unsupported;
 * - `NotMountedError` if the component is not mounted.
 * @since Mini Apps v7.7
 */
export interface SwipeBehavior extends StatefulComponent<SwipeBehaviorState>, MountableComponent {
  /**
   * @returns True if the SDK is initialized and the component is supported by the Telegram
   * client.
   */
  isSupported: () => boolean;
  /**
   * True if the user can minimize or close the mini app with a vertical swipe.
   */
  isVerticalEnabled: Computed<boolean>;
  /**
   * Allows the user to minimize or close the mini app with a vertical swipe.
   */
  enableVertical: () => void;
  /**
   * Prevents the user from minimizing or closing the mini app with a vertical swipe.
   */
  disableVertical: () => void;
  /**
   * Mounts the component. If the page was reloaded, the state saved before the reload is
   * restored.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {MethodUnsupportedError} The component is unsupported.
   */
  mount: () => void;
}

const METHOD = 'web_app_setup_swipe_behavior';

/**
 * @internal
 */
export function createSwipeBehavior(): SwipeBehavior {
  const core = createComponentCore('swipeBehavior', { isVerticalEnabled: true });
  const set = (isVerticalEnabled: boolean) => () => {
    const { postEvent } = requireMethod(METHOD);
    core.assertMounted();
    if (core.state.get().isVerticalEnabled !== isVerticalEnabled) {
      postEvent(METHOD, { allow_vertical_swipe: isVerticalEnabled });
      core.state.update({ isVerticalEnabled });
    }
  };

  return {
    isSupported: () => isMethodSupported(METHOD),
    isVerticalEnabled: computedPick(core.state, 'isVerticalEnabled'),
    enableVertical: set(true),
    disableVertical: set(false),
    state: computedFromStore(core.state),
    isMounted: computedFromStore(core.mounted),
    mount() {
      requireMethod(METHOD);
      core.mount();
    },
    unmount() {
      core.unmount();
    },
  };
}

/**
 * Controls whether the user can minimize or close the mini app with a vertical swipe.
 * @since Mini Apps v7.7
 */
export const swipeBehavior = /* @__PURE__ */ createSwipeBehavior();
