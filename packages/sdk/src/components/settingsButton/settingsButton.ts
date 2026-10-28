import { type ButtonComponent, createButton } from '../../button.js';
import { type Computed, computedPick } from '../../store.js';

export interface SettingsButtonState {
  isVisible: boolean;
}

/**
 * @since Mini Apps v6.10
 */
export interface SettingsButton extends ButtonComponent<SettingsButtonState> {
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
export function createSettingsButton(): SettingsButton {
  const { component, core, setter } = createButton({
    clickEvent: 'settings_button_pressed',
    initialState: { isVisible: false },
    method: 'web_app_setup_settings_button',
    name: 'settingsButton',
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
 * The "Settings" item in the mini app context menu.
 * @since Mini Apps v6.10
 */
export const settingsButton = /* @__PURE__ */ createSettingsButton();
