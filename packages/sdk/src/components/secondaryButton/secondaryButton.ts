import type { SecondaryButtonPosition } from '@tma.js/bridge';

import { type BottomButton, type BottomButtonState, createBottomButton } from '../../createBottomButton.js';
import { type Computed, computedPick } from '../../store.js';
import { type MiniApp, miniApp as defaultMiniApp } from '../miniApp/miniApp.js';
import { themeParams as defaultThemeParams, type ThemeParamsComponent } from '../themeParams/themeParams.js';

export interface SecondaryButtonState extends BottomButtonState {
  /**
   * Position of the button relative to the main button.
   */
  position: SecondaryButtonPosition;
}

/**
 * @since Mini Apps v7.10
 */
export interface SecondaryButton extends BottomButton<SecondaryButtonState> {
  position: Computed<SecondaryButtonPosition>;
  /**
   * Sets the button position relative to the main button.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {MethodUnsupportedError} The button is unsupported.
   * @throws {NotMountedError} The button is not mounted.
   */
  setPosition: (position: SecondaryButtonPosition) => void;
}

/**
 * @internal
 */
export function createSecondaryButton(
  theme: ThemeParamsComponent = defaultThemeParams,
  app: MiniApp = defaultMiniApp,
): SecondaryButton {
  const { core, setState, component } = createBottomButton<SecondaryButtonState>({
    name: 'secondaryButton',
    method: 'web_app_setup_secondary_button',
    clickEvent: 'secondary_button_pressed',
    initialState: {
      hasShineEffect: false,
      isEnabled: true,
      isLoaderVisible: false,
      isVisible: false,
      position: 'left',
      text: 'Cancel',
    },
    defaultBgColor: () => app.bottomBarColorRgb() || theme.secondaryBgColor() || '#ffffff',
    defaultTextColor: () => theme.buttonColor() || '#2481cc',
    sources: [theme.state.subscribe, app.bottomBarColorRgb.subscribe],
    toParams: state => ({ position: state.position }),
  });
  return {
    ...component,
    position: computedPick(core.state, 'position'),
    setPosition: position => setState({ position }),
  };
}

/**
 * The secondary button displayed at the bottom of the mini app. Default colors are taken from
 * `themeParams` and `miniApp`, so mount them to get the actual ones.
 * @since Mini Apps v7.10
 */
export const secondaryButton = /* @__PURE__ */ createSecondaryButton();
