import type { RGB } from '@tma.js/bridge';

import { type ButtonComponent, type ButtonClickEvent, createButton, removeUndefined } from './button.js';
import { isMethodSupported, isParamSupported } from './globals.js';
import { type WithIsSupported, type WithSupports, withIsSupported } from './is-supported.js';
import { type Computed, computed, computedPick, type SubscribeFn } from './store.js';

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
 * Button parameters released later than the button itself.
 */
export type BottomButtonFeature = 'hasShineEffect' | 'iconCustomEmojiId';

/**
 * Base API of buttons displayed at the bottom of the mini app.
 *
 * All the setters throw:
 * - `NotInitializedError` if the SDK is not initialized;
 * - `MethodUnsupportedError` if the button is unsupported;
 * - `MethodParameterUnsupportedError` if the passed parameter is unsupported. Use
 * `setParams.supports` to check it;
 * - `NotMountedError` if the button is not mounted.
 */
export interface BottomButton<S extends BottomButtonState> extends ButtonComponent<S> {
  /**
   * The background color, or the default one if it was not set.
   */
  bgColor: Computed<RGB>;
  disable: () => void;
  disableShineEffect: WithIsSupported<() => void>;
  enable: () => void;
  enableShineEffect: WithIsSupported<() => void>;
  hasShineEffect: Computed<boolean>;
  hide: () => void;
  hideLoader: () => void;
  iconCustomEmojiId: Computed<string | undefined>;
  isEnabled: Computed<boolean>;
  isLoaderVisible: Computed<boolean>;
  isVisible: Computed<boolean>;
  setBgColor: (color: RGB) => void;
  /**
   * @since Mini Apps v9.5
   */
  setIconCustomEmojiId: WithIsSupported<(id: string) => void>;
  /**
   * Updates several button parameters at once. Undefined values are ignored.
   * @example
   * mainButton.setParams({ text: 'Submit', isVisible: true, isEnabled: false });
   * mainButton.setParams.supports('iconCustomEmojiId'); // true since Mini Apps v9.5
   */
  setParams: WithSupports<(params: Partial<S>) => void, BottomButtonFeature>;
  setText: (text: string) => void;
  setTextColor: (color: RGB) => void;
  show: () => void;
  showLoader: () => void;
  text: Computed<string>;
  /**
   * The text color, or the default one if it was not set.
   */
  textColor: Computed<RGB>;
}

export interface CreateBottomButtonOptions<S extends BottomButtonState> {
  clickEvent: ButtonClickEvent;
  defaultBgColor: () => RGB;
  defaultTextColor: () => RGB;
  initialState: S;
  method: 'web_app_setup_main_button' | 'web_app_setup_secondary_button';
  name: string;
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
  const { core, setState, setter } = button;
  const get = <K extends keyof S>(key: K) => computedPick(core.state, key);
  const features: Record<BottomButtonFeature, () => boolean> = {
    hasShineEffect: () => isParamSupported(options.method, 'has_shine_effect'),
    iconCustomEmojiId: () => isParamSupported(options.method, 'icon_custom_emoji_id'),
  };

  const component: BottomButton<S> = {
    ...button.component,
    bgColor: computed(() => core.state.get().bgColor || defaultBgColor(), core.subscribe),
    disable: setter('isEnabled', false),
    disableShineEffect: withIsSupported(setter('hasShineEffect', false), features.hasShineEffect),
    enable: setter('isEnabled', true),
    enableShineEffect: withIsSupported(setter('hasShineEffect', true), features.hasShineEffect),
    hasShineEffect: get('hasShineEffect'),
    hide: setter('isVisible', false),
    hideLoader: setter('isLoaderVisible', false),
    iconCustomEmojiId: get('iconCustomEmojiId'),
    isEnabled: get('isEnabled'),
    isLoaderVisible: get('isLoaderVisible'),
    isVisible: get('isVisible'),
    setBgColor: bgColor => setState({ bgColor } as Partial<S>),
    setIconCustomEmojiId: withIsSupported((iconCustomEmojiId: string) => {
      setState({ iconCustomEmojiId } as Partial<S>);
    }, features.iconCustomEmojiId),
    setParams: withIsSupported(
      (params: Partial<S>) => setState(params),
      () => isMethodSupported(options.method),
      features,
    ),
    setText: text => setState({ text } as Partial<S>),
    setTextColor: textColor => setState({ textColor } as Partial<S>),
    show: setter('isVisible', true),
    showLoader: setter('isLoaderVisible', true),
    text: get('text'),
    textColor: computed(() => core.state.get().textColor || defaultTextColor(), core.subscribe),
  };
  return { ...button, component };
}
