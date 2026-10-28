import { err, ok, onEvent, type RGB } from '@tma.js/bridge';

import type { AnyColor, ColorKey, MiniApp, MiniAppState } from './types.js';
import { safeIsColorDark, safeToRGB } from '../../colors.js';
import { createComponentCore } from '../../component.js';
import { createCSSVarsBinding, toKebab } from '../../css-vars.js';
import { UnknownThemeParamsKeyError } from '../../errors.js';
import {
  getGlobals,
  isInitialized,
  isMethodSupported,
  isParamSupported,
  requireMethod,
} from '../../globals.js';
import { throwingWithIsSupported, withIsSupported } from '../../is-supported.js';
import { computed, computedFromStore, computedPick } from '../../store.js';

import { themeParams as defaultThemeParams, type ThemeParamsComponent } from '../themeParams/themeParams.js';

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
  }, theme.state.subscribe);
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
  const createRgbGetter = (key: ColorKey) => {
    return () => toRgb(state.get()[key]);
  };
  const bgColorRgb = computed(createRgbGetter('bgColor'), core.subscribe);

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
  const isSetterSupported = (key: ColorKey) => () => isMethodSupported(METHODS[key]);

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
    bgColor: createRgbGetter('bgColor')(),
    bottomBarColor: createRgbGetter('bottomBarColor')(),
    headerColor: createRgbGetter('headerColor')(),
  });
  const cssVars = createCSSVarsBinding<ColorKey>(getCssValues, core.subscribe);
  let cleanups: VoidFunction[] = [];

  const safeSetBgColor = withIsSupported(safeSetter('bgColor'), isSetterSupported('bgColor'));
  const safeSetBottomBarColor = withIsSupported(
    safeSetter('bottomBarColor'),
    isSetterSupported('bottomBarColor'),
  );
  const safeSetHeaderColor = withIsSupported(
    safeSetter('headerColor'),
    isSetterSupported('headerColor'),
    { rgb: () => isParamSupported(METHODS.headerColor, 'color') },
  );

  return {
    bgColor: computedPick(state, 'bgColor'),
    bgColorRgb,
    bindCssVars(getName = key => `--tg-${toKebab(key)}`) {
      core.assertMounted();
      return cssVars.bind(getName);
    },
    bottomBarColor: computedPick(state, 'bottomBarColor'),
    bottomBarColorRgb: computed(createRgbGetter('bottomBarColor'), core.subscribe),
    close: withIsSupported(
      (returnBack?: boolean) => {
        getGlobals().postEvent('web_app_close', returnBack ? { return_back: true } : {});
      },
      isInitialized,
      { returnBack: () => isParamSupported('web_app_close', 'return_back') },
    ),
    headerColor: computedPick(state, 'headerColor'),
    headerColorRgb: computed(createRgbGetter('headerColor'), core.subscribe),
    isActive: computedPick(state, 'isActive'),
    isCssVarsBound: computedFromStore(cssVars.bound),
    isDark: computed(() => {
      const color = bgColorRgb();
      const isDark = color && safeIsColorDark(color);
      return !!isDark && isDark.ok && isDark.data;
    }, core.subscribe),
    isMounted: computedFromStore(core.mounted),
    isSupported: () => Object.values(METHODS).some(isMethodSupported),
    mount() {
      getGlobals();
      theme.isMounted() || theme.mount();
      if (!core.mount()) {
        return;
      }
      sentColors = Object.fromEntries(
        (Object.keys(METHODS) as ColorKey[]).map(key => [key, createRgbGetter(key)()]),
      );
      cleanups = [
        onEvent('visibility_changed', ({ is_visible }) => {
          state.update({ isActive: is_visible });
        }),
        theme.state.subscribe(syncThemeColors),
      ];
    },
    ready() {
      getGlobals().postEvent('web_app_ready');
    },
    safeSetBgColor,
    safeSetBottomBarColor,
    safeSetHeaderColor,
    setBgColor: throwingWithIsSupported(safeSetBgColor),
    setBottomBarColor: throwingWithIsSupported(safeSetBottomBarColor),
    setHeaderColor: throwingWithIsSupported(safeSetHeaderColor),
    state: computedFromStore(state),
    unmount() {
      if (core.unmount()) {
        cleanups.forEach(cleanup => cleanup());
      }
    },
  };
}

/**
 * The mini app itself: its colors, activity state and lifecycle methods.
 */
export const miniApp = /* @__PURE__ */ createMiniApp();
