import { createComponentCore } from '../../component.js';
import { isMethodSupported, requireMethod } from '../../globals.js';
import { type Computed, computedFromStore, computedPick } from '../../store.js';
import type { MountableComponent, StatefulComponent } from '../../types.js';

export interface ClosingBehaviorState {
  isConfirmationEnabled: boolean;
}

/**
 * Methods changing the state throw:
 * - `NotInitializedError` if the SDK is not initialized;
 * - `NotMountedError` if the component is not mounted.
 */
export interface ClosingBehavior extends StatefulComponent<ClosingBehaviorState>,
  MountableComponent {
  /**
   * @returns True if the SDK is initialized.
   */
  isSupported: () => boolean;
  /**
   * True if the user is asked to confirm closing the mini app.
   */
  isConfirmationEnabled: Computed<boolean>;
  /**
   * Makes the Telegram client ask the user to confirm closing the mini app.
   */
  enableConfirmation: () => void;
  /**
   * Allows closing the mini app without confirmation.
   */
  disableConfirmation: () => void;
  /**
   * Mounts the component. If the page was reloaded, the state saved before the reload is
   * restored.
   * @throws {NotInitializedError} The SDK is not initialized.
   */
  mount: () => void;
}

const METHOD = 'web_app_setup_closing_behavior';

/**
 * @internal
 */
export function createClosingBehavior(): ClosingBehavior {
  const core = createComponentCore('closingBehavior', { isConfirmationEnabled: false });
  const set = (isConfirmationEnabled: boolean) => () => {
    const { postEvent } = requireMethod(METHOD);
    core.assertMounted();
    if (core.state.get().isConfirmationEnabled !== isConfirmationEnabled) {
      postEvent(METHOD, { need_confirmation: isConfirmationEnabled });
      core.state.update({ isConfirmationEnabled });
    }
  };

  return {
    isSupported: () => isMethodSupported(METHOD),
    isConfirmationEnabled: computedPick(core.state, 'isConfirmationEnabled'),
    enableConfirmation: set(true),
    disableConfirmation: set(false),
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
 * Controls whether the user should confirm closing the mini app.
 */
export const closingBehavior = /* @__PURE__ */ createClosingBehavior();
