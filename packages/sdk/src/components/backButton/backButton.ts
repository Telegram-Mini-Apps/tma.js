import { type ButtonComponent, createButton } from '../../button.js';
import { type Computed, computedPick } from '../../store.js';

export interface BackButtonState {
  isVisible: boolean;
}

/**
 * @since Mini Apps v6.1
 */
export interface BackButton extends ButtonComponent<BackButtonState> {
  /**
   * Hides the button.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {MethodUnsupportedError} The button is unsupported.
   * @throws {NotMountedError} The button is not mounted.
   */
  hide: () => void;
  /**
   * True if the button is visible.
   */
  isVisible: Computed<boolean>;
  /**
   * Shows the button.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {MethodUnsupportedError} The button is unsupported.
   * @throws {NotMountedError} The button is not mounted.
   */
  show: () => void;
}

/**
 * @internal
 */
export function createBackButton(): BackButton {
  const { component, core, setter } = createButton({
    clickEvent: 'back_button_pressed',
    initialState: { isVisible: false },
    method: 'web_app_setup_back_button',
    name: 'backButton',
    toParams: state => ({ is_visible: state.isVisible }),
  });
  return {
    ...component,
    hide: setter('isVisible', false),
    isVisible: computedPick(core.state, 'isVisible'),
    show: setter('isVisible', true),
  };
}

/**
 * The back button displayed in the mini app header.
 * @since Mini Apps v6.1
 */
export const backButton = /* @__PURE__ */ createBackButton();
