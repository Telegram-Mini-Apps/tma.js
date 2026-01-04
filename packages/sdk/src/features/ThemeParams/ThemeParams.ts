import type { EventListener } from '@tma.js/bridge';
import { computed, type Computed, signal } from '@tma.js/signals';
import { snakeToKebab } from '@tma.js/toolkit';
import type { ThemeParams as ThemeParamsType, RGB } from '@tma.js/types';
import { either as E } from 'fp-ts';

import { Mountable } from '@/composables/Mountable.js';
import { Stateful } from '@/composables/Stateful.js';
import { CSSVarsBoundError } from '@/errors.js';
import type { SharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import type { WithStateRestore } from '@/fn-options/withStateRestore.js';
import { access } from '@/helpers/access.js';
import { deleteCssVar, setCssVar } from '@/helpers/css-vars.js';
import { isColorDark } from '@/helpers/isColorDark.js';
import type { MaybeAccessor } from '@/types.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import {
  createWithChecksFp,
  type WithChecks,
  type WithChecksFp,
} from '@/with-checks/withChecksFp.js';

export type ThemeParamsState = ThemeParamsType;

export interface ThemeParamsOptions extends WithStateRestore<ThemeParamsState>,
  SharedFeatureOptions {
  /**
   * Removes a theme change listener.
   * @param listener - a listener to remove.
   */
  offChange: (listener: EventListener<'theme_changed'>) => void;
  /**
   * Adds a theme change listener.
   * @returns A function to remove listener.
   * @param listener - a listener to add.
   */
  onChange: (listener: EventListener<'theme_changed'>) => void;
  /**
   * Theme parameters initial state.
   */
  initialState: MaybeAccessor<ThemeParamsType>;
}

export interface ThemeParamsGetCssVarNameFn {
  /**
   * @param property - palette key.
   * @returns Computed complete CSS variable name.
   */
  (property: Extract<keyof ThemeParamsType, string>): string;
}

export class ThemeParams {
  constructor({
    initialState,
    onChange,
    offChange,
    isTma,
    storage,
    isPageReload,
  }: ThemeParamsOptions) {
    const stateful = new Stateful<ThemeParamsState>({
      initialState: {},
      onChange: storage.set,
    });
    const listener: EventListener<'theme_changed'> = event => {
      stateful.setState(event.theme_params);
    };
    const mountable = new Mountable<ThemeParamsType>({
      initialState: () => E.right(access(initialState)),
      isPageReload,
      onMounted(state) {
        stateful.setState(state);
        onChange(listener);
      },
      onUnmounted() {
        offChange(listener);
      },
      restoreState: storage.get,
    });

    const wrapOptions = { isTma, returns: 'either' } as const;
    const wrapSupportedEither = createWithChecksFp(wrapOptions);
    const wrapMountedEither = createWithChecksFp({
      ...wrapOptions,
      isMounted: mountable.isMounted,
    });

    // Colors.
    this.accentTextColor = stateful.getter('accent_text_color');
    this.bgColor = stateful.getter('bg_color');
    this.buttonColor = stateful.getter('button_color');
    this.buttonTextColor = stateful.getter('button_text_color');
    this.bottomBarBgColor = stateful.getter('bottom_bar_bg_color');
    this.destructiveTextColor = stateful.getter('destructive_text_color');
    this.headerBgColor = stateful.getter('header_bg_color');
    this.hintColor = stateful.getter('hint_color');
    this.linkColor = stateful.getter('link_color');
    this.secondaryBgColor = stateful.getter('secondary_bg_color');
    this.sectionBgColor = stateful.getter('section_bg_color');
    this.sectionHeaderTextColor = stateful.getter('section_header_text_color');
    this.sectionSeparatorColor = stateful.getter('section_separator_color');
    this.subtitleTextColor = stateful.getter('subtitle_text_color');
    this.textColor = stateful.getter('text_color');

    // Other public signals.
    this.state = stateful.state;
    this.isMounted = mountable.isMounted;
    this.bindCssVarsFp = wrapMountedEither(getCSSVarName => {
      if (this._isCssVarsBound()) {
        return E.left(new CSSVarsBoundError());
      }
      getCSSVarName ||= prop => `--tg-theme-${snakeToKebab(prop)}`;

      const forEachEntry = (fn: (key: string, value: RGB) => void): void => {
        Object.entries(stateful.state()).forEach(([k, v]) => {
          v && fn(k, v);
        });
      };

      const actualize = (): void => {
        forEachEntry((k, v) => {
          setCssVar(getCSSVarName(k), v);
        });
      };

      actualize();
      stateful.state.sub(actualize);
      this._isCssVarsBound.set(true);

      return E.right(() => {
        forEachEntry(deleteCssVar);
        stateful.state.unsub(actualize);
        this._isCssVarsBound.set(false);
      });
    });
    this.mountFp = wrapSupportedEither(mountable.mount);
    this.unmount = mountable.unmount;

    this.bindCssVars = throwifyWithChecksFp(this.bindCssVarsFp);
    this.mount = throwifyWithChecksFp(this.mountFp);
  }

  //#region Colors.
  /**
   * @since v6.10
   */
  readonly accentTextColor: Computed<RGB | undefined>;

  readonly bgColor: Computed<RGB | undefined>;

  readonly buttonColor: Computed<RGB | undefined>;

  readonly buttonTextColor: Computed<RGB | undefined>;

  /**
   * @since v7.10
   */
  readonly bottomBarBgColor: Computed<RGB | undefined>;

  readonly destructiveTextColor: Computed<RGB | undefined>;

  /**
   * @since v6.10
   */
  readonly headerBgColor: Computed<RGB | undefined>;

  readonly hintColor: Computed<RGB | undefined>;

  readonly linkColor: Computed<RGB | undefined>;

  readonly secondaryBgColor: Computed<RGB | undefined>;

  /**
   * @since v6.10
   */
  readonly sectionBgColor: Computed<RGB | undefined>;

  /**
   * @since v6.10
   */
  readonly sectionHeaderTextColor: Computed<RGB | undefined>;

  /**
   * @since v7.6
   */
  readonly sectionSeparatorColor: Computed<RGB | undefined>;

  /**
   * @since v6.10
   */
  readonly subtitleTextColor: Computed<RGB | undefined>;

  readonly textColor: Computed<RGB | undefined>;
  //#endregion

  //#region CSS variables.
  private readonly _isCssVarsBound = signal(false);

  /**
   * True if CSS variables are currently bound.
   */
  readonly isCssVarsBound = computed(this._isCssVarsBound);

  /**
   * Creates CSS variables connected with the current theme parameters.
   *
   * By default, created CSS variables names are following the pattern "--tg-theme-{name}", where
   * {name} is a theme parameters key name converted from snake case to kebab case.
   *
   * Default variables:
   * - `--tg-theme-bg-color`
   * - `--tg-theme-secondary-text-color`
   *
   * Variables are being automatically updated if theme parameters were changed.
   *
   * @param getCSSVarName - function, returning complete CSS variable name for the specified
   * theme parameters key.
   * @returns Function to stop updating variables.
   * @throws {CSSVarsBoundError} CSS variables are already bound
   * @example Using custom CSS vars generator
   * themeParams.bindCssVars(key => `--my-prefix-${key}`);
   */
  readonly bindCssVarsFp: WithChecksFp<
    (getCSSVarName?: ThemeParamsGetCssVarNameFn) => E.Either<CSSVarsBoundError, VoidFunction>,
    false
  >;

  /**
   * @see bindCssVarsFp
   */
  readonly bindCssVars: WithChecks<
    (getCSSVarName?: ThemeParamsGetCssVarNameFn) => VoidFunction,
    false
  >;
  //#endregion

  //#region Other public signals.
  /**
   * Complete component state.
   */
  readonly state: Computed<ThemeParamsType>;

  /**
   * @returns True if the current color scheme is recognized as dark.
   * This value is calculated based on the current theme's background color.
   */
  readonly isDark = computed(() => {
    const color = this.bgColor();
    return !color || isColorDark(color);
  });
  //#endregion

  //#region Mounting.
  /**
   * Signal indicating if the component is currently mounted.
   */
  readonly isMounted: Computed<boolean>;

  /**
   * Mounts the component restoring its state.
   */
  readonly mountFp: WithChecksFp<() => E.Either<never, void>, false>;

  /**
   * @see mountFp
   */
  readonly mount: WithChecks<() => void, false>;

  /**
   * Unmounts the component.
   */
  readonly unmount: () => void;
  //#endregion
}
