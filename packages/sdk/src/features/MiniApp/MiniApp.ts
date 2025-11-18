import {
  supports,
  type PostEventError,
  type EventPayload,
  type EventListener,
} from '@tma.js/bridge';
import { type Computed, computed } from '@tma.js/signals';
import { signal } from '@tma.js/signals';
import { createCbCollector, camelToKebab } from '@tma.js/toolkit';
import { isRGB } from '@tma.js/transformers';
import type { KnownThemeParamsKey, RGB, ThemeParams } from '@tma.js/types';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

import { Mountable } from '@/composables/Mountable.js';
import { Stateful } from '@/composables/Stateful.js';
import { CSSVarsBoundError, UnknownThemeParamsKeyError } from '@/errors.js';
import type { SharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import type { WithPostEvent } from '@/fn-options/withPostEvent.js';
import type { WithStateRestore } from '@/fn-options/withStateRestore.js';
import type { WithVersion } from '@/fn-options/withVersion.js';
import { access } from '@/helpers/access.js';
import { deleteCssVar, setCssVar } from '@/helpers/css-vars.js';
import { isColorDark } from '@/helpers/isColorDark.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import {
  createWithChecksFp,
  type WithChecks,
  withChecksFp,
  type WithChecksFp,
} from '@/with-checks/withChecksFp.js';

type AnyColor = RGB | KnownThemeParamsKey | string;

export interface MiniAppState {
  bgColor: AnyColor;
  bottomBarColor: AnyColor;
  headerColor: AnyColor;
  isActive: boolean;
}

export interface MiniAppGetCssVarNameFn {
  /**
   * @param property - mini app property.
   * @returns Computed complete CSS variable name.
   */
  (property: 'bgColor' | 'bottomBarColor' | 'headerColor'): string;
}

type WithListeners<Handlers extends string, Payload> = {
  [K in Handlers]: (listener: (payload: Payload) => void) => void;
};

export interface MiniAppOptions extends WithPostEvent,
  WithVersion,
  WithStateRestore<MiniAppState>,
  WithListeners<'onVisibilityChanged' | 'offVisibilityChanged', EventPayload<'visibility_changed'>>,
  SharedFeatureOptions {
  /**
   * The current theme parameters.
   */
  theme: Computed<ThemeParams>;
}

/**
 * @since Mini Apps v6.1
 */
export class MiniApp {
  constructor({
    storage,
    isPageReload,
    version,
    postEvent,
    isTma,
    theme,
    onVisibilityChanged,
    offVisibilityChanged,
  }: MiniAppOptions) {
    //#region Mounting.
    const visibilityChangedListener: EventListener<'visibility_changed'> = event => {
      stateful.setState({ isActive: event.is_visible });
    };
    const themeChangedListener = (theme: ThemeParams) => {
      // Sometimes we may have the following colors to be specified as some theme params keys.
      // Due to the Mini Apps nature, we are not really allowed to do that, but we want to provide
      // such an opportunity to developers.
      //
      // So if the developer specified some field as a reference to some theme params key, we
      // should find an according RGB color for it and send it to the Telegram client. We have one
      // exclusion here - the method 'web_app_set_header_color' may accept values 'bg_color'
      // and 'secondary_bg_color'. Other methods accept only RGB values.
      ([
        [this.headerColor, 'web_app_set_header_color'],
        [this.bgColor, 'web_app_set_background_color'],
        [this.bottomBarColor, 'web_app_set_bottom_bar_color'],
      ] as const).forEach(([signal, method]) => {
        const color = signal();
        // The value is already in RGB format, we have nothing to update here.
        if (isRGB(color)) {
          return;
        }
        // The real RGB value should only be extracted for the following methods:
        // - 'web_app_set_background_color'
        // - 'web_app_set_bottom_bar_color'
        // We should also do it in case of the 'web_app_set_header_color' method, if the value
        // specified is not 'bg_color' and 'secondary_bg_color' (unknown key to
        // the Telegram client).
        if (
          method !== 'web_app_set_header_color'
          || !['bg_color', 'secondary_bg_color'].includes(color)
        ) {
          const rgb = theme[color];
          if (rgb) {
            postEvent(method, { color: rgb });
          }
        }
      });
    };
    const mountable = new Mountable({
      initialState() {
        return E.right({
          bgColor: 'bg_color',
          headerColor: 'header_bg_color',
          bottomBarColor: 'bottom_bar_bg_color',
          isActive: true,
        });
      },
      isPageReload,
      onMounted: state => {
        onVisibilityChanged(visibilityChangedListener);
        theme.sub(themeChangedListener);
        stateful.setState(state);
      },
      onUnmounted() {
        offVisibilityChanged(visibilityChangedListener);
        theme.unsub(themeChangedListener);
      },
      restoreState: storage.get,
    });
    this.isMounted = mountable.isMounted;
    this.mountFp = withChecksFp(() => {
      const nothing = () => undefined;
      return pipe(mountable.mount(), E.match(nothing, nothing));
    }, { isTma, returns: 'plain' });
    this.mount = throwifyWithChecksFp(this.mountFp);
    this.unmount = mountable.unmount;
    //#endregion

    //#region State.
    const stateful = new Stateful({
      initialState: {
        bgColor: 'bg_color',
        bottomBarColor: 'bottom_bar_bg_color',
        headerColor: 'bg_color',
        isActive: false,
      },
      onChange: storage.set,
    });
    this.state = stateful.state;

    const rgbBasedOn = (color: AnyColor): RGB | undefined => {
      return isRGB(color) ? color : access(theme)[color];
    };
    const computedRgbBasedOn = (signal: Computed<AnyColor>): Computed<RGB | undefined> => {
      return computed(() => rgbBasedOn(signal()));
    };
    //#endregion

    //#region Other properties.
    this.isActive = stateful.getter('isActive');
    this.isSupported = computed(() => {
      return ([
        'web_app_set_header_color',
        'web_app_set_background_color',
        'web_app_set_bottom_bar_color',
      ] as const).some(method => supports(method, access(version)));
    });
    //#endregion

    //#region Css vars.
    const isCssVarsBound = signal(false);
    this.isCssVarsBound = computed(isCssVarsBound);
    this.bindCssVarsFp = withChecksFp(getCSSVarName => {
      if (isCssVarsBound()) {
        return E.left(new CSSVarsBoundError());
      }
      const [addCleanup, cleanup] = createCbCollector(() => {
        isCssVarsBound.set(false);
      });

      const bind = (cssVar: string, signal: Computed<RGB | undefined>) => {
        const update = () => {
          setCssVar(cssVar, signal() || null);
        };
        update();
        addCleanup(signal.sub(update), deleteCssVar.bind(null, cssVar));
      };

      getCSSVarName ||= prop => `--tg-${camelToKebab(prop)}`;
      bind(getCSSVarName('bgColor'), this.bgColorRgb);
      bind(getCSSVarName('bottomBarColor'), this.bottomBarColorRgb);
      bind(getCSSVarName('headerColor'), this.headerColorRgb);

      isCssVarsBound.set(true);

      return E.right(cleanup);
    }, { isTma, returns: 'either', isMounted: this.isMounted });
    this.bindCssVars = throwifyWithChecksFp(this.bindCssVarsFp);
    //#endregion

    //#region Colors.
    type GenColorToolsetResult<K extends Exclude<keyof MiniAppState, 'isActive'>> = [
      rawColor: Computed<AnyColor>,
      rgbColor: Computed<RGB | undefined>,
      throwing: WithChecks<
        (color: AnyColor) => void,
        true,
        K extends 'headerColor' ? 'rgb' : never
      >,
      fp: WithChecksFp<
        (color: AnyColor) => E.Either<UnknownThemeParamsKeyError | PostEventError, void>,
        true,
        K extends 'headerColor' ? 'rgb' : never
      >,
    ];
    const genColorToolset = <K extends Exclude<keyof MiniAppState, 'isActive'>>(
      stateKey: K,
    ): GenColorToolsetResult<K> => {
      const rawColor = stateful.getter(stateKey);
      const rgbColor = computedRgbBasedOn(rawColor);
      const method = ({
        headerColor: 'web_app_set_header_color',
        bgColor: 'web_app_set_background_color',
        bottomBarColor: 'web_app_set_bottom_bar_color',
      } as const)[stateKey];

      const fp = withChecksFp(
        (color: AnyColor): E.Either<UnknownThemeParamsKeyError | PostEventError, void> => {
          if (color === rawColor()) {
            return E.right(undefined);
          }
          if (
            method === 'web_app_set_header_color'
            && (color === 'bg_color' || color === 'secondary_bg_color')
          ) {
            return pipe(
              postEvent('web_app_set_header_color', { color_key: color }),
              E.map(() => {
                stateful.setState({ [stateKey]: color });
              }),
            );
          }
          const rgb = rgbBasedOn(color);
          return pipe(
            rgb
              ? postEvent(method, { color: rgb })
              : E.left(new UnknownThemeParamsKeyError(color)),
            E.map(() => {
              stateful.setState({ [stateKey]: rgb });
            }),
          );
        },
        {
          isTma,
          version,
          requires: method,
          isMounted: this.isMounted,
          returns: 'either',
          supports: stateKey === 'headerColor'
            ? {
              rgb: {
                method: 'web_app_set_header_color',
                param: 'color',
                shouldCheck: isRGB,
              },
            }
            : undefined,
        },
      );

      return [rawColor, rgbColor, throwifyWithChecksFp(fp), fp] as GenColorToolsetResult<K>;
    };
    [
      this.bgColor,
      this.bgColorRgb,
      this.setBgColor,
      this.setBgColorFp,
    ] = genColorToolset('bgColor');
    [
      this.headerColor,
      this.headerColorRgb,
      this.setHeaderColor,
      this.setHeaderColorFp,
    ] = genColorToolset('headerColor');
    [
      this.bottomBarColor,
      this.bottomBarColorRgb,
      this.setBottomBarColor,
      this.setBottomBarColorFp,
    ] = genColorToolset('bottomBarColor');
    //#endregion

    //#region Other methods.
    const withBasicEither = createWithChecksFp({ isTma, returns: 'either' });
    this.closeFp = withBasicEither(returnBack => {
      return postEvent('web_app_close', { return_back: returnBack });
    });
    this.close = throwifyWithChecksFp(this.closeFp);

    this.readyFp = withBasicEither(() => postEvent('web_app_ready'));
    this.ready = throwifyWithChecksFp(this.readyFp);
    //#endregion
  }

  //#region Other properties.
  /**
   * Signal indicating if the component is supported.
   */
  readonly isSupported: Computed<boolean>;

  /**
   * True if the current Mini App background color is recognized as dark.
   */
  readonly isDark = computed(() => {
    const color = this.bgColorRgb();
    return color ? isColorDark(color) : false;
  });

  /**
   * Signal indicating if the mini app is currently active.
   */
  readonly isActive: Computed<boolean>;

  /**
   * Complete component state.
   */
  readonly state: Computed<MiniAppState>;
  //#endregion

  //#region CSS variables.
  /**
   * True if the CSS variables are currently bound.
   */
  readonly isCssVarsBound: Computed<boolean>;

  /**
   * Creates CSS variables connected with the mini app.
   *
   * Default variables:
   * - `--tg-bg-color`
   * - `--tg-header-color`
   * - `--tg-bottom-bar-color`
   *
   * Variables are being automatically updated if theme parameters were changed.
   *
   * @param getCSSVarName - function, returning complete CSS variable name for the specified
   * mini app key.
   * @returns Function to stop updating variables.
   * @example Using no arguments
   * miniApp.bindCssVars();
   * @example Using custom CSS vars generator
   * miniApp.bindCssVars(key => `--my-prefix-${key}`);
   */
  readonly bindCssVarsFp: WithChecksFp<
    (getCssVarName?: MiniAppGetCssVarNameFn) => E.Either<CSSVarsBoundError, VoidFunction>,
    false
  >;

  readonly bindCssVars: WithChecks<(getCssVarName?: MiniAppGetCssVarNameFn) => VoidFunction, false>;
  //#endregion

  //#region Mounting.
  /**
   * Signal indicating if the component is mounted.
   */
  readonly isMounted: Computed<boolean>;

  /**
   * Mounts the component.
   *
   * This function restores the component state and is automatically saving it in the local storage
   * if it changed.
   * @since Mini Apps v6.1
   */
  readonly mountFp: WithChecksFp<() => void, false>;

  /**
   * @see mount
   */
  readonly mount: WithChecks<() => void, false>;

  /**
   * Unmounts the component.
   */
  readonly unmount: () => void;
  //#endregion

  //#region Background color.
  /**
   * The Mini App background color.
   *
   * Represents an RGB color, or theme parameters key, like "bg_color", "secondary_bg_color", etc.
   *
   * Note that using a theme parameters key, background color becomes bound to the current
   * theme parameters, making it automatically being updated whenever theme parameters change.
   * In order to remove this bind, use an explicit RGB color.
   */
  readonly bgColor: Computed<AnyColor>;

  /**
   * RGB representation of the background color.
   *
   * This value requires the Theme Params component to be mounted to extract a valid RGB value
   * of the color key.
   */
  readonly bgColorRgb: Computed<RGB | undefined>;

  /**
   * Updates the mini app background color.
   * @since Mini Apps v6.1
   */
  readonly setBgColorFp: WithChecksFp<
    (color: AnyColor) => E.Either<PostEventError | UnknownThemeParamsKeyError, void>,
    true
  >;

  /**
   * @see setBgColorFp
   */
  readonly setBgColor: WithChecks<(color: AnyColor) => void, true>;
  //#endregion

  //#region Header color.
  /**
   * The Mini App header color.
   */
  readonly headerColor: Computed<AnyColor>;

  /**
   * RGB representation of the header color.
   *
   * This value requires the Theme Params component to be mounted to extract a valid RGB value
   * of the color key.
   */
  readonly headerColorRgb: Computed<RGB | undefined>;

  /**
   * Updates the mini app header color.
   * @since Mini Apps v6.1
   */
  readonly setHeaderColorFp: WithChecksFp<
    (color: AnyColor) => E.Either<PostEventError | UnknownThemeParamsKeyError, void>,
    true,
    'rgb'
  >;

  /**
   * @see setHeaderColorFp
   */
  readonly setHeaderColor: WithChecks<(color: AnyColor) => void, true, 'rgb'>;
  //#endregion

  //#region Bottom bar background color.
  /**
   * The Mini App bottom bar background color.
   */
  readonly bottomBarColor: Computed<AnyColor>;

  /**
   * RGB representation of the bottom bar background color.
   *
   * This value requires the Theme Params component to be mounted to extract a valid RGB value
   * of the color key.
   */
  readonly bottomBarColorRgb: Computed<RGB | undefined>;

  /**
   * Updates the mini app bottom bar bg color.
   * @since Mini Apps v7.10
   */
  readonly setBottomBarColorFp: WithChecksFp<
    (color: AnyColor) => E.Either<PostEventError | UnknownThemeParamsKeyError, void>,
    true
  >;

  /**
   * @see setBottomBarColorFp
   */
  readonly setBottomBarColor: WithChecks<(color: AnyColor) => void, true>;
  //#endregion

  //#region Other methods.
  /**
   * Closes the Mini App.
   * @param returnBack - should the client return to the previous activity.
   */
  readonly closeFp: WithChecksFp<(returnBack?: boolean) => E.Either<PostEventError, void>, false>;

  /**
   * @see closeFp
   */
  readonly close: WithChecks<(returnBack?: boolean) => void, false>;

  /**
   * Informs the Telegram app that the Mini App is ready to be displayed.
   *
   * It is recommended to call this method as early as possible, as soon as all
   * essential interface elements loaded.
   *
   * Once this method is called, the loading placeholder is hidden and the Mini
   * App shown.
   *
   * If the method is not called, the placeholder will be hidden only when the
   * page was fully loaded.
   */
  readonly readyFp: WithChecksFp<() => E.Either<PostEventError, void>, false>;

  /**
   * @see readyFp
   */
  readonly ready: WithChecks<() => void, false>;
  //#endregion
}
