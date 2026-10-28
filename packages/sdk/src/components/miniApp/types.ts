import type { Result, RGB } from '@tma.js/bridge';

import type { UnknownThemeParamsKeyError } from '../../errors.js';
import type { WithIsSupported, WithSupports } from '../../is-supported.js';
import type { Computed } from '../../store.js';
import type { MountableComponent, StatefulComponent } from '../../types.js';

/**
 * Color in any format supported by `toRGB`, or a theme parameters key, e.g. `bg_color`.
 */
export type AnyColor = RGB | string;

export interface MiniAppState {
  bgColor: AnyColor;
  bottomBarColor: AnyColor;
  headerColor: AnyColor;
  isActive: boolean;
}

export type ColorKey = 'bgColor' | 'bottomBarColor' | 'headerColor';

type SafeColorSetter = (color: AnyColor) => Result<UnknownThemeParamsKeyError, void>;

type ColorSetter = (color: AnyColor) => void;

/**
 * Color setters throw:
 * - `NotInitializedError` if the SDK is not initialized;
 * - `MethodUnsupportedError` if the method is unsupported. Use the setter `isSupported` method to
 * check it;
 * - `MethodParameterUnsupportedError` if the color format is unsupported. Header color in RGB
 * format is supported since Mini Apps v6.9, use `setHeaderColor.supports('rgb')` to check it;
 * - `NotMountedError` if the component is not mounted.
 */
export interface MiniApp extends StatefulComponent<MiniAppState>, MountableComponent {
  /**
   * The background color as it was set: RGB or a theme parameters key.
   */
  bgColor: Computed<AnyColor>;
  /**
   * The background color in the `#RRGGBB` format, if it is known.
   */
  bgColorRgb: Computed<RGB | undefined>;
  /**
   * Creates CSS variables reflecting the mini app colors in the `#RRGGBB` format. By default,
   * the variables are `--tg-bg-color`, `--tg-bottom-bar-color` and `--tg-header-color`.
   * @param getName - function returning a CSS variable name for the color. If it returns a falsy
   * value, the variable is not created.
   * @returns Function removing the variables.
   * @throws {NotMountedError} The component is not mounted.
   * @throws {CSSVarsBoundError} CSS variables are already bound.
   */
  bindCssVars: (getName?: (key: ColorKey) => string | null | undefined | false) => VoidFunction;
  /**
   * The bottom bar color as it was set: RGB or a theme parameters key.
   */
  bottomBarColor: Computed<AnyColor>;
  /**
   * The bottom bar color in the `#RRGGBB` format, if it is known.
   */
  bottomBarColorRgb: Computed<RGB | undefined>;
  /**
   * Closes the mini app.
   * @param returnBack - return the user to the chat the mini app was opened from, if it was
   * opened from an inline button. Use `close.supports('returnBack')` to check if it is supported.
   * @throws {NotInitializedError} The SDK is not initialized.
   */
  close: WithSupports<(returnBack?: boolean) => void, 'returnBack'>;
  /**
   * The header color as it was set: RGB or a theme parameters key.
   */
  headerColor: Computed<AnyColor>;
  /**
   * The header color in the `#RRGGBB` format, if it is known.
   */
  headerColorRgb: Computed<RGB | undefined>;
  /**
   * True if the mini app is active, i.e. it is currently selected among other opened mini apps.
   * @since Mini Apps v8.0
   */
  isActive: Computed<boolean>;
  /**
   * True if CSS variables are bound.
   */
  isCssVarsBound: Computed<boolean>;
  /**
   * True if the background color is dark.
   */
  isDark: Computed<boolean>;
  /**
   * @returns True if the SDK is initialized and the Telegram client supports changing any of the
   * mini app colors.
   */
  isSupported: () => boolean;
  /**
   * Mounts the component. It also mounts `themeParams`, as the colors depend on the theme.
   * @throws {NotInitializedError} The SDK is not initialized.
   */
  mount: () => void;
  /**
   * Notifies the Telegram client that the mini app is ready to be displayed. Call it as early as
   * possible to hide the loading placeholder.
   * @throws {NotInitializedError} The SDK is not initialized.
   */
  ready: () => void;
  /**
   * Sets the background color. A theme parameters key makes the color follow the theme.
   * @param color - color or theme parameters key.
   * @returns `UnknownThemeParamsKeyError` if the theme has no color with the passed key.
   * @since Mini Apps v6.1
   */
  safeSetBgColor: WithIsSupported<SafeColorSetter>;
  /**
   * Sets the bottom bar color. A theme parameters key makes the color follow the theme.
   * @param color - color or theme parameters key.
   * @returns `UnknownThemeParamsKeyError` if the theme has no color with the passed key.
   * @since Mini Apps v7.10
   */
  safeSetBottomBarColor: WithIsSupported<SafeColorSetter>;
  /**
   * Sets the header color. The `bg_color` and `secondary_bg_color` keys are passed to the
   * Telegram client as is. Other theme parameters keys make the color follow the theme, and are
   * sent as RGB.
   * @param color - color or theme parameters key.
   * @returns `UnknownThemeParamsKeyError` if the theme has no color with the passed key.
   * @since Mini Apps v6.1
   * @example
   * safeSetHeaderColor.supports('rgb'); // true since Mini Apps v6.9
   */
  safeSetHeaderColor: WithSupports<SafeColorSetter, 'rgb'>;
  /**
   * Throwing version of `safeSetBgColor`.
   * @throws {UnknownThemeParamsKeyError} The theme has no color with the passed key.
   * @since Mini Apps v6.1
   */
  setBgColor: WithIsSupported<ColorSetter>;
  /**
   * Throwing version of `safeSetBottomBarColor`.
   * @throws {UnknownThemeParamsKeyError} The theme has no color with the passed key.
   * @since Mini Apps v7.10
   */
  setBottomBarColor: WithIsSupported<ColorSetter>;
  /**
   * Throwing version of `safeSetHeaderColor`.
   * @throws {UnknownThemeParamsKeyError} The theme has no color with the passed key.
   * @since Mini Apps v6.1
   */
  setHeaderColor: WithSupports<ColorSetter, 'rgb'>;
}
