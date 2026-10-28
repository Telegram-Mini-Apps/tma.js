import { type BottomButton, type BottomButtonState, createBottomButton } from '../../createBottomButton.js';
import { themeParams as defaultThemeParams, type ThemeParamsComponent } from '../themeParams/themeParams.js';

export type MainButtonState = BottomButtonState;

export type MainButton = BottomButton<MainButtonState>;

/**
 * @internal
 */
export function createMainButton(theme: ThemeParamsComponent = defaultThemeParams): MainButton {
  return createBottomButton<MainButtonState>({
    clickEvent: 'main_button_pressed',
    defaultBgColor: () => theme.buttonColor() || '#2481cc',
    defaultTextColor: () => theme.buttonTextColor() || '#ffffff',
    initialState: {
      hasShineEffect: false,
      isEnabled: true,
      isLoaderVisible: false,
      isVisible: false,
      text: 'Continue',
    },
    method: 'web_app_setup_main_button',
    name: 'mainButton',
    sources: [theme.state.subscribe],
  }).component;
}

/**
 * The main button displayed at the bottom of the mini app. Default colors are taken from
 * `themeParams`, so mount it to get the actual ones.
 */
export const mainButton = /* @__PURE__ */ createMainButton();
