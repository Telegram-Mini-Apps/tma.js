import { onEvent, type RGB, type ThemeParams } from '@tma.js/bridge';

import { safeIsColorDark } from '../../colors.js';
import { createComponentCore } from '../../component.js';
import { createCSSVarsBinding, toKebab } from '../../css-vars.js';
import { getGlobals } from '../../globals.js';
import { type Computed, computed, computedFromStore } from '../../store.js';
import type { MountableComponent, StatefulComponent } from '../../types.js';

export interface ThemeParamsComponent extends StatefulComponent<ThemeParams>, MountableComponent {
  /**
   * @since Mini Apps v6.10
   */
  accentTextColor: Computed<RGB | undefined>;
  bgColor: Computed<RGB | undefined>;
  /**
   * @since Mini Apps v7.10
   */
  bottomBarBgColor: Computed<RGB | undefined>;
  buttonColor: Computed<RGB | undefined>;
  buttonTextColor: Computed<RGB | undefined>;
  /**
   * @since Mini Apps v6.10
   */
  destructiveTextColor: Computed<RGB | undefined>;
  /**
   * @since Mini Apps v6.10
   */
  headerBgColor: Computed<RGB | undefined>;
  hintColor: Computed<RGB | undefined>;
  linkColor: Computed<RGB | undefined>;
  secondaryBgColor: Computed<RGB | undefined>;
  /**
   * @since Mini Apps v6.10
   */
  sectionBgColor: Computed<RGB | undefined>;
  /**
   * @since Mini Apps v6.10
   */
  sectionHeaderTextColor: Computed<RGB | undefined>;
  /**
   * @since Mini Apps v7.6
   */
  sectionSeparatorColor: Computed<RGB | undefined>;
  /**
   * @since Mini Apps v6.10
   */
  subtitleTextColor: Computed<RGB | undefined>;
  textColor: Computed<RGB | undefined>;
  /**
   * True if the background color is dark.
   */
  isDark: Computed<boolean>;
  /**
   * True if CSS variables are bound.
   */
  isCssVarsBound: Computed<boolean>;
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
  const color = (key: string) => computed(() => state.get()[key], state.subscribe);
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
    isDark: computed(() => {
      const bgColor = state.get().bg_color;
      if (!bgColor) {
        return false;
      }
      const result = safeIsColorDark(bgColor);
      return result.ok && result.data;
    }, state.subscribe),
    isCssVarsBound: computedFromStore(cssVars.bound),
    bindCssVars(getName = key => `--tg-theme-${toKebab(key)}`) {
      core.assertMounted();
      return cssVars.bind(getName);
    },
    state: computedFromStore(state),
    isMounted: computedFromStore(core.mounted),
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
