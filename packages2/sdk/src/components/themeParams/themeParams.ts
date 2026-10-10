import { onEvent, type RGB, type ThemeParams } from '@tma.js/bridge';

import { safeIsColorDark } from '../../colors.js';
import { createComponentCore } from '../../component.js';
import { createCSSVarsBinding, toKebab } from '../../css-vars.js';
import { getGlobals } from '../../globals.js';
import { combineSubscribe } from '../../store.js';
import type { MountableComponent, StatefulComponent } from '../../types.js';

export interface ThemeParamsComponent extends StatefulComponent<ThemeParams>, MountableComponent {
  /**
   * @since Mini Apps v6.10
   */
  accentTextColor: () => RGB | undefined;
  bgColor: () => RGB | undefined;
  /**
   * @since Mini Apps v7.10
   */
  bottomBarBgColor: () => RGB | undefined;
  buttonColor: () => RGB | undefined;
  buttonTextColor: () => RGB | undefined;
  /**
   * @since Mini Apps v6.10
   */
  destructiveTextColor: () => RGB | undefined;
  /**
   * @since Mini Apps v6.10
   */
  headerBgColor: () => RGB | undefined;
  hintColor: () => RGB | undefined;
  linkColor: () => RGB | undefined;
  secondaryBgColor: () => RGB | undefined;
  /**
   * @since Mini Apps v6.10
   */
  sectionBgColor: () => RGB | undefined;
  /**
   * @since Mini Apps v6.10
   */
  sectionHeaderTextColor: () => RGB | undefined;
  /**
   * @since Mini Apps v7.6
   */
  sectionSeparatorColor: () => RGB | undefined;
  /**
   * @since Mini Apps v6.10
   */
  subtitleTextColor: () => RGB | undefined;
  textColor: () => RGB | undefined;
  /**
   * @returns True if the background color is dark.
   */
  isDark: () => boolean;
  /**
   * @returns True if CSS variables are bound.
   */
  isCssVarsBound: () => boolean;
  /**
   * Creates CSS variables reflecting the theme parameters and updates them whenever the theme
   * changes. By default, variables are named `--tg-theme-{key}`, where `{key}` is a theme
   * parameters key in kebab case, e.g. `--tg-theme-bg-color`.
   * @param getName - function returning a CSS variable name for the theme parameters key.
   * If it returns a falsy value, the variable is not created.
   * @returns Function removing the variables.
   * @throws {NotMountedError} The component is not mounted.
   * @throws {CSSVarsBoundError} CSS variables are already bound.
   * @example
   * themeParams.bindCssVars();
   * themeParams.bindCssVars(key => `--my-prefix-${key}`);
   */
  bindCssVars: (getName?: (key: string) => string | null | undefined | false) => VoidFunction;
  /**
   * Mounts the component. It takes the theme from launch parameters, or restores the state saved
   * before the page reload, and starts listening to theme changes.
   * @throws {NotInitializedError} The SDK is not initialized.
   */
  mount: () => void;
}

/**
 * @internal
 */
export function createThemeParams(): ThemeParamsComponent {
  const core = createComponentCore<ThemeParams>('themeParams', {});
  const { state } = core;
  const color = (key: string) => () => state.get()[key];
  const cssVars = createCSSVarsBinding(state.get, state.subscribe);
  let stopListening: VoidFunction | undefined;

  return {
    accentTextColor: color('accent_text_color'),
    bgColor: color('bg_color'),
    bottomBarBgColor: color('bottom_bar_bg_color'),
    buttonColor: color('button_color'),
    buttonTextColor: color('button_text_color'),
    destructiveTextColor: color('destructive_text_color'),
    headerBgColor: color('header_bg_color'),
    hintColor: color('hint_color'),
    linkColor: color('link_color'),
    secondaryBgColor: color('secondary_bg_color'),
    sectionBgColor: color('section_bg_color'),
    sectionHeaderTextColor: color('section_header_text_color'),
    sectionSeparatorColor: color('section_separator_color'),
    subtitleTextColor: color('subtitle_text_color'),
    textColor: color('text_color'),
    isDark() {
      const bgColor = state.get().bg_color;
      if (!bgColor) {
        return false;
      }
      const result = safeIsColorDark(bgColor);
      return result.ok && result.data;
    },
    isCssVarsBound: cssVars.bound.get,
    bindCssVars(getName = key => `--tg-theme-${toKebab(key)}`) {
      core.assertMounted();
      return cssVars.bind(getName);
    },
    state: state.get,
    subscribe: combineSubscribe(core.subscribe, cssVars.bound.subscribe),
    isMounted: core.mounted.get,
    mount() {
      const { launchParams } = getGlobals();
      if (core.mount(launchParams.tgWebAppThemeParams)) {
        stopListening = onEvent('theme_changed', ({ theme_params }) => {
          state.set(theme_params);
        });
      }
    },
    unmount() {
      if (core.unmount()) {
        stopListening && stopListening();
      }
    },
  };
}

/**
 * Theme parameters of the mini app.
 * @see https://docs.telegram-mini-apps.com/platform/theming
 */
export const themeParams = /* @__PURE__ */ createThemeParams();
