import { err, ok, onEvent, type Result, type RGB, throwing } from '@tma.js/bridge';

import { safeIsColorDark, safeToRGB } from '../../colors.js';
import { createComponentCore } from '../../component.js';
import { createCSSVarsBinding, toKebab } from '../../css-vars.js';
import { UnknownThemeParamsKeyError } from '../../errors.js';
import { getGlobals, isMethodSupported, requireMethod } from '../../globals.js';
import { combineSubscribe } from '../../store.js';
import type { MountableComponent, StatefulComponent } from '../../types.js';

import { themeParams as defaultThemeParams, type ThemeParamsComponent } from '../themeParams/themeParams.js';

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

type ColorKey = 'bgColor' | 'bottomBarColor' | 'headerColor';

/**
 * Color setters throw:
 * - `NotInitializedError` if the SDK is not initialized;
 * - `MethodUnsupportedError` if the method is unsupported;
 * - `MethodParameterUnsupportedError` if the color format is unsupported. Header color in RGB
 * format is supported since Mini Apps v6.9;
 * - `NotMountedError` if the component is not mounted.
 */
export interface MiniApp extends StatefulComponent<MiniAppState>, MountableComponent {
  /**
   * @returns True if the SDK is initialized and the Telegram client supports changing any of the
   * mini app colors.
   */
  isSupported: () => boolean;
  /**
   * @returns True if the mini app is active, i.e. it is currently selected among other opened
   * mini apps.
   * @since Mini Apps v8.0
   */
  isActive: () => boolean;
  /**
   * @returns True if the background color is dark.
   */
  isDark: () => boolean;
  /**
   * @returns The background color as it was set: RGB or a theme parameters key.
   */
  bgColor: () => AnyColor;
  /**
   * @returns The background color in the `#RRGGBB` format, if it is known.
   */
  bgColorRgb: () => RGB | undefined;
  /**
   * @returns The bottom bar color as it was set: RGB or a theme parameters key.
   */
  bottomBarColor: () => AnyColor;
  /**
   * @returns The bottom bar color in the `#RRGGBB` format, if it is known.
   */
  bottomBarColorRgb: () => RGB | undefined;
  /**
   * @returns The header color as it was set: RGB or a theme parameters key.
   */
  headerColor: () => AnyColor;
  /**
   * @returns The header color in the `#RRGGBB` format, if it is known.
   */
  headerColorRgb: () => RGB | undefined;
  /**
   * Sets the background color. A theme parameters key makes the color follow the theme.
   * @param color - color or theme parameters key.
   * @returns `UnknownThemeParamsKeyError` if the theme has no color with the passed key.
   * @since Mini Apps v6.1
   */
  safeSetBgColor: (color: AnyColor) => Result<UnknownThemeParamsKeyError, void>;
  /**
   * Throwing version of `safeSetBgColor`.
   * @throws {UnknownThemeParamsKeyError} The theme has no color with the passed key.
   * @since Mini Apps v6.1
   */
  setBgColor: (color: AnyColor) => void;
  /**
   * Sets the bottom bar color. A theme parameters key makes the color follow the theme.
   * @param color - color or theme parameters key.
   * @returns `UnknownThemeParamsKeyError` if the theme has no color with the passed key.
   * @since Mini Apps v7.10
   */
  safeSetBottomBarColor: (color: AnyColor) => Result<UnknownThemeParamsKeyError, void>;
  /**
   * Throwing version of `safeSetBottomBarColor`.
   * @throws {UnknownThemeParamsKeyError} The theme has no color with the passed key.
   * @since Mini Apps v7.10
   */
  setBottomBarColor: (color: AnyColor) => void;
  /**
   * Sets the header color. The `bg_color` and `secondary_bg_color` keys are passed to the
   * Telegram client as is. Other theme parameters keys make the color follow the theme.
   * @param color - color or theme parameters key.
   * @returns `UnknownThemeParamsKeyError` if the theme has no color with the passed key.
   * @since Mini Apps v6.1
   */
  safeSetHeaderColor: (color: AnyColor) => Result<UnknownThemeParamsKeyError, void>;
  /**
   * Throwing version of `safeSetHeaderColor`.
   * @throws {UnknownThemeParamsKeyError} The theme has no color with the passed key.
   * @since Mini Apps v6.1
   */
  setHeaderColor: (color: AnyColor) => void;
  /**
   * @returns True if CSS variables are bound.
   */
  isCssVarsBound: () => boolean;
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
   * Mounts the component. It also mounts `themeParams`, as the colors depend on the theme.
   * @throws {NotInitializedError} The SDK is not initialized.
   */
  mount: () => void;
  /**
   * Closes the mini app.
   * @param returnBack - return the user to the chat the mini app was opened from, if it was
   * opened from an inline button.
   * @throws {NotInitializedError} The SDK is not initialized.
   */
  close: (returnBack?: boolean) => void;
  /**
   * Notifies the Telegram client that the mini app is ready to be displayed. Call it as early as
   * possible to hide the loading placeholder.
   * @throws {NotInitializedError} The SDK is not initialized.
   */
  ready: () => void;
}

const METHODS = {
  bgColor: 'web_app_set_background_color',
  bottomBarColor: 'web_app_set_bottom_bar_color',
  headerColor: 'web_app_set_header_color',
} as const;

/**
 * @returns True if the Telegram client accepts the header color key itself.
 */
function isHeaderColorKey(key: ColorKey, color: AnyColor): boolean {
  return key === 'headerColor' && (color === 'bg_color' || color === 'secondary_bg_color');
}

/**
 * @internal
 */
export function createMiniApp(theme: ThemeParamsComponent = defaultThemeParams): MiniApp {
  const core = createComponentCore<MiniAppState>('miniApp', {
    bgColor: 'bg_color',
    bottomBarColor: 'bottom_bar_bg_color',
    headerColor: 'bg_color',
    isActive: true,
  }, theme.subscribe);
  const { state } = core;

  const toRgb = (color: AnyColor): RGB | undefined => {
    const theme_ = theme.state();
    const value = safeToRGB(color).ok
      ? color
      : Object.prototype.hasOwnProperty.call(theme_, color)
        ? theme_[color]
        // Like the official SDK, the default bottom bar color falls back to the secondary
        // background color.
        : color === 'bottom_bar_bg_color' ? theme_.secondary_bg_color : undefined;
    const rgb = value && safeToRGB(value);
    return rgb && rgb.ok ? rgb.data : undefined;
  };
  const rgbOf = (key: ColorKey) => () => toRgb(state.get()[key]);

  /**
   * Posts the color to the Telegram client.
   * @returns False if the color is unknown.
   */
  const post = (key: ColorKey, color: AnyColor): boolean => {
    const { postEvent } = getGlobals();
    if (isHeaderColorKey(key, color)) {
      postEvent('web_app_set_header_color', { color_key: color as 'bg_color' });
      return true;
    }
    const rgb = toRgb(color);
    rgb && postEvent(METHODS[key], { color: rgb });
    return !!rgb;
  };

  // Colors following the theme are sent to the Telegram client whenever the theme changes.
  let sentColors: Partial<Record<ColorKey, RGB | undefined>> = {};

  const safeSetter = (key: ColorKey) => (color: AnyColor) => {
    requireMethod(METHODS[key]);
    core.assertMounted();
    if (state.get()[key] === color) {
      return ok(undefined);
    }
    if (!post(key, color)) {
      return err(new UnknownThemeParamsKeyError(color));
    }
    sentColors[key] = toRgb(color);
    state.update({ [key]: color });
    return ok(undefined);
  };

  const syncThemeColors = () => {
    (Object.keys(METHODS) as ColorKey[]).forEach(key => {
      const color = state.get()[key];
      const rgb = toRgb(color);
      if (isHeaderColorKey(key, color) || rgb === sentColors[key]) {
        return;
      }
      sentColors[key] = rgb;
      if (rgb && isMethodSupported(METHODS[key])) {
        getGlobals().postEvent(METHODS[key], { color: rgb });
      }
    });
  };

  const getCssValues = () => ({
    bgColor: rgbOf('bgColor')(),
    bottomBarColor: rgbOf('bottomBarColor')(),
    headerColor: rgbOf('headerColor')(),
  });
  const cssVars = createCSSVarsBinding<ColorKey>(getCssValues, core.subscribe);
  let cleanups: VoidFunction[] = [];

  const safeSetBgColor = safeSetter('bgColor');
  const safeSetBottomBarColor = safeSetter('bottomBarColor');
  const safeSetHeaderColor = safeSetter('headerColor');

  return {
    isSupported: () => Object.values(METHODS).some(isMethodSupported),
    isActive: () => state.get().isActive,
    isDark() {
      const color = rgbOf('bgColor')();
      const isDark = color && safeIsColorDark(color);
      return !!isDark && isDark.ok && isDark.data;
    },
    bgColor: () => state.get().bgColor,
    bgColorRgb: rgbOf('bgColor'),
    bottomBarColor: () => state.get().bottomBarColor,
    bottomBarColorRgb: rgbOf('bottomBarColor'),
    headerColor: () => state.get().headerColor,
    headerColorRgb: rgbOf('headerColor'),
    safeSetBgColor,
    setBgColor: throwing(safeSetBgColor),
    safeSetBottomBarColor,
    setBottomBarColor: throwing(safeSetBottomBarColor),
    safeSetHeaderColor,
    setHeaderColor: throwing(safeSetHeaderColor),
    isCssVarsBound: cssVars.bound.get,
    bindCssVars(getName = key => `--tg-${toKebab(key)}`) {
      core.assertMounted();
      return cssVars.bind(getName);
    },
    state: state.get,
    subscribe: combineSubscribe(core.subscribe, cssVars.bound.subscribe),
    isMounted: core.mounted.get,
    mount() {
      getGlobals();
      theme.isMounted() || theme.mount();
      if (!core.mount()) {
        return;
      }
      sentColors = Object.fromEntries(
        (Object.keys(METHODS) as ColorKey[]).map(key => [key, rgbOf(key)()]),
      );
      cleanups = [
        onEvent('visibility_changed', ({ is_visible }) => {
          state.update({ isActive: is_visible });
        }),
        theme.subscribe(syncThemeColors),
      ];
    },
    unmount() {
      if (core.unmount()) {
        cleanups.forEach(cleanup => cleanup());
      }
    },
    close(returnBack) {
      getGlobals().postEvent('web_app_close', returnBack ? { return_back: true } : {});
    },
    ready() {
      getGlobals().postEvent('web_app_ready');
    },
  };
}

/**
 * The mini app itself: its colors, activity state and lifecycle methods.
 */
export const miniApp = /* @__PURE__ */ createMiniApp();
