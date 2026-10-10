import type { RGB } from '@tma.js/bridge';

import { type ButtonComponent, type ButtonClickEvent, createButton, removeUndefined } from './button.js';
import type { SubscribeFn } from './store.js';

export interface BottomButtonState {
  /**
   * Background color. If omitted, the Telegram client default is used.
   */
  bgColor?: RGB;
  hasShineEffect: boolean;
  /**
   * Identifier of the custom emoji displayed alongside the button text.
   * @since Mini Apps v9.5
   */
  iconCustomEmojiId?: string;
  isEnabled: boolean;
  isLoaderVisible: boolean;
  isVisible: boolean;
  text: string;
  /**
   * Text color. If omitted, the Telegram client default is used.
   */
  textColor?: RGB;
}

/**
 * Base API of buttons displayed at the bottom of the mini app.
 *
 * All the setters throw:
 * - `NotInitializedError` if the SDK is not initialized;
 * - `MethodUnsupportedError` if the button is unsupported;
 * - `MethodParameterUnsupportedError` if the passed parameter is unsupported;
 * - `NotMountedError` if the button is not mounted.
 */
export interface BottomButton<S extends BottomButtonState> extends ButtonComponent<S> {
  /**
   * @returns The background color, or the default one if it was not set.
   */
  bgColor: () => RGB;
  /**
   * @returns The text color, or the default one if it was not set.
   */
  textColor: () => RGB;
  hasShineEffect: () => boolean;
  iconCustomEmojiId: () => string | undefined;
  isEnabled: () => boolean;
  isLoaderVisible: () => boolean;
  isVisible: () => boolean;
  text: () => string;
  /**
   * Updates several button parameters at once. Undefined values are ignored.
   * @example
   * mainButton.setParams({ text: 'Submit', isVisible: true, isEnabled: false });
   */
  setParams: (params: Partial<S>) => void;
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  showLoader: () => void;
  hideLoader: () => void;
  enableShineEffect: () => void;
  disableShineEffect: () => void;
  setText: (text: string) => void;
  setBgColor: (color: RGB) => void;
  setTextColor: (color: RGB) => void;
  /**
   * @since Mini Apps v9.5
   */
  setIconCustomEmojiId: (id: string) => void;
}

export interface CreateBottomButtonOptions<S extends BottomButtonState> {
  name: string;
  method: 'web_app_setup_main_button' | 'web_app_setup_secondary_button';
  clickEvent: ButtonClickEvent;
  initialState: S;
  defaultBgColor: () => RGB;
  defaultTextColor: () => RGB;
  /**
   * Changes sources the default colors depend on.
   */
  sources: SubscribeFn[];
  /**
   * @returns Additional method parameters.
   */
  toParams?: (state: S) => object;
}

/**
 * Creates the base of a bottom button component.
 * @internal
 */
export function createBottomButton<S extends BottomButtonState>({
  defaultBgColor,
  defaultTextColor,
  toParams,
  ...options
}: CreateBottomButtonOptions<S>) {
  const button = createButton({
    ...options,
    // Parameters with undefined values are removed, so unsupported parameters are not sent to
    // the Telegram client unless the developer has set them.
    toParams: state => removeUndefined({
      color: state.bgColor,
      has_shine_effect: state.hasShineEffect,
      icon_custom_emoji_id: state.iconCustomEmojiId,
      is_active: state.isEnabled,
      is_progress_visible: state.isLoaderVisible,
      is_visible: state.isVisible,
      text: state.text,
      text_color: state.textColor,
      ...toParams && toParams(state),
    }),
  });
  const { core, setter, setState } = button;
  const get = <K extends keyof S>(key: K) => () => core.state.get()[key];

  const component: BottomButton<S> = {
    ...button.component,
    bgColor: () => core.state.get().bgColor || defaultBgColor(),
    textColor: () => core.state.get().textColor || defaultTextColor(),
    hasShineEffect: get('hasShineEffect'),
    iconCustomEmojiId: get('iconCustomEmojiId'),
    isEnabled: get('isEnabled'),
    isLoaderVisible: get('isLoaderVisible'),
    isVisible: get('isVisible'),
    text: get('text'),
    setParams: setState,
    show: setter('isVisible', true),
    hide: setter('isVisible', false),
    enable: setter('isEnabled', true),
    disable: setter('isEnabled', false),
    showLoader: setter('isLoaderVisible', true),
    hideLoader: setter('isLoaderVisible', false),
    enableShineEffect: setter('hasShineEffect', true),
    disableShineEffect: setter('hasShineEffect', false),
    setText: text => setState({ text } as Partial<S>),
    setBgColor: bgColor => setState({ bgColor } as Partial<S>),
    setTextColor: textColor => setState({ textColor } as Partial<S>),
    setIconCustomEmojiId: iconCustomEmojiId => setState({ iconCustomEmojiId } as Partial<S>),
  };
  return { ...button, component };
}
