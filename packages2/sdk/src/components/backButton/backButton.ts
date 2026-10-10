import { type ButtonComponent, createButton } from '../../button.js';

export interface BackButtonState {
  isVisible: boolean;
}

/**
 * @since Mini Apps v6.1
 */
export interface BackButton extends ButtonComponent<BackButtonState> {
  /**
   * @returns True if the button is visible.
   */
  isVisible: () => boolean;
  /**
   * Shows the button.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {MethodUnsupportedError} The button is unsupported.
   * @throws {NotMountedError} The button is not mounted.
   */
  show: () => void;
  /**
   * Hides the button.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {MethodUnsupportedError} The button is unsupported.
   * @throws {NotMountedError} The button is not mounted.
   */
  hide: () => void;
}

/**
 * @internal
 */
export function createBackButton(): BackButton {
  const { core, setter, component } = createButton({
    name: 'backButton',
    method: 'web_app_setup_back_button',
    clickEvent: 'back_button_pressed',
    initialState: { isVisible: false },
    toParams: state => ({ is_visible: state.isVisible }),
  });
  return {
    ...component,
    isVisible: () => core.state.get().isVisible,
    show: setter('isVisible', true),
    hide: setter('isVisible', false),
  };
}

/**
 * The back button displayed in the mini app header.
 * @since Mini Apps v6.1
 */
export const backButton = /* @__PURE__ */ createBackButton();
