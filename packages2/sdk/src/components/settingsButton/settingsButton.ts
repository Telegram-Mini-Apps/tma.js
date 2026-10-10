import { type ButtonComponent, createButton } from '../../button.js';

export interface SettingsButtonState {
  isVisible: boolean;
}

/**
 * @since Mini Apps v6.10
 */
export interface SettingsButton extends ButtonComponent<SettingsButtonState> {
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
export function createSettingsButton(): SettingsButton {
  const { core, setter, component } = createButton({
    name: 'settingsButton',
    method: 'web_app_setup_settings_button',
    clickEvent: 'settings_button_pressed',
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
 * The "Settings" item in the mini app context menu.
 * @since Mini Apps v6.10
 */
export const settingsButton = /* @__PURE__ */ createSettingsButton();
