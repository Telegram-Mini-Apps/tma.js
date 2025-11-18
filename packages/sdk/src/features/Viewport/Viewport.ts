import {
  type SafeAreaInsets,
  type EventListener,
  supports,
  type RequestError,
  type PostEventError,
} from '@tma.js/bridge';
import { Computed, computed, signal } from '@tma.js/signals';
import { camelToKebab } from '@tma.js/toolkit';
import { BetterPromise } from 'better-promises';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import { AsyncMountable } from '@/composables/AsyncMountable.js';
import { Stateful } from '@/composables/Stateful.js';
import { CSSVarsBoundError, FullscreenFailedError } from '@/errors.js';
import { SharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { WithPostEvent } from '@/fn-options/withPostEvent.js';
import { WithRequest } from '@/fn-options/withRequest.js';
import { WithStateRestore } from '@/fn-options/withStateRestore.js';
import { WithVersion } from '@/fn-options/withVersion.js';
import { access } from '@/helpers/access.js';
import { deleteCssVar, setCssVar } from '@/helpers/css-vars.js';
import { AsyncOptions } from '@/types.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import { createWithChecksFp, WithChecks, WithChecksFp } from '@/with-checks/withChecksFp.js';

type FullscreenError = FullscreenFailedError | RequestError;
type ViewportChangedEventListener = EventListener<'viewport_changed'>;
type FullscreenChangedEventListener = EventListener<'fullscreen_changed'>;
type SafeAreaInsetsChangedEventListener = EventListener<'safe_area_changed'>;
type SafeAreaInsetCSSVarKey = `safeAreaInset${Capitalize<keyof SafeAreaInsets>}`;

export type GetCSSVarNameKey =
  | 'width'
  | 'height'
  | 'stableHeight'
  | SafeAreaInsetCSSVarKey
  | `content${Capitalize<SafeAreaInsetCSSVarKey>}`;

export type GetCSSVarNameFn = (key: GetCSSVarNameKey) => string | null | undefined | false;

export interface ViewportState {
  contentSafeAreaInsets: SafeAreaInsets;
  height: number;
  isExpanded: boolean;
  isFullscreen: boolean;
  safeAreaInsets: SafeAreaInsets;
  stableHeight: number;
  width: number;
}

type WithListeners<On extends string, Off extends string, L> = {
  [K in On | Off]: (listener: L) => void;
};

export interface ViewportOptions<EViewportStable, EFullscreen>
  extends WithStateRestore<ViewportState>,
  WithVersion,
  WithRequest,
  WithPostEvent,
  WithListeners<'onViewportChanged', 'offViewportChanged', ViewportChangedEventListener>,
  WithListeners<'onFullscreenChanged', 'offFullscreenChanged', FullscreenChangedEventListener>,
  WithListeners<'onSafeAreaInsetsChanged', 'offSafeAreaInsetsChanged', SafeAreaInsetsChangedEventListener>,
  WithListeners<'onContentSafeAreaInsetsChanged', 'offContentSafeAreaInsetsChanged', SafeAreaInsetsChangedEventListener>,
  SharedFeatureOptions {
  /**
   * True if the viewport is stable.
   */
  isViewportStable: boolean | (() => E.Either<EViewportStable, boolean>);
  /**
   * True if the application was opened in fullscreen initially.
   */
  isFullscreen: boolean | (() => E.Either<EFullscreen, boolean>);
}

export class Viewport<EViewportStable, EFullscreen> {
  constructor({
    storage,
    isPageReload,
    onContentSafeAreaInsetsChanged,
    onSafeAreaInsetsChanged,
    onViewportChanged,
    onFullscreenChanged,
    offContentSafeAreaInsetsChanged,
    offFullscreenChanged,
    offSafeAreaInsetsChanged,
    offViewportChanged,
    request,
    isViewportStable,
    isFullscreen,
    isTma,
    version,
    postEvent,
  }: ViewportOptions<EViewportStable, EFullscreen>) {
    const initialInsets: SafeAreaInsets = { top: 0, right: 0, left: 0, bottom: 0 };
    const stateful = new Stateful<ViewportState>({
      initialState: {
        contentSafeAreaInsets: initialInsets,
        height: 0,
        isExpanded: false,
        isFullscreen: false,
        safeAreaInsets: initialInsets,
        stableHeight: 0,
        width: 0,
      },
      onChange: storage.set,
    });

    const viewportChangedListener: ViewportChangedEventListener = event => {
      stateful.setState({
        isExpanded: event.is_expanded,
        height: event.height,
        width: event.width,
        stableHeight: event.is_state_stable ? event.height : undefined,
      });
    };
    const fullscreenChangedListener: FullscreenChangedEventListener = event => {
      stateful.setState({ isFullscreen: event.is_fullscreen });
    };
    const safeAreaInsetsChangedListener: SafeAreaInsetsChangedEventListener = event => {
      stateful.setState({ safeAreaInsets: event });
    };
    const contentSafeAreaInsetsChangedListener: SafeAreaInsetsChangedEventListener = event => {
      stateful.setState({ contentSafeAreaInsets: event });
    };

    const mountable = new AsyncMountable({
      initialState(options) {
        const genRequestInsets = (kind: 'safe-area' | 'content-safe-area') => {
          return () => {
            const [method, event] = kind === 'safe-area'
              ? ['web_app_request_safe_area', 'safe_area_changed'] as const
              : ['web_app_request_content_safe_area', 'content_safe_area_changed'] as const;

            if (!supports(method, access(version))) {
              return TE.right({ top: 0, left: 0, right: 0, bottom: 0 });
            }
            return request(method, event, options);
          };
        };
        const genFlag = <E>(flag: boolean | (() => E.Either<E, boolean>)) => {
          return () => (
            typeof flag === 'boolean'
              ? TE.right(flag)
              : TE.fromEither(flag())
          );
        };

        return pipe(
          TE.Do,
          TE.bindW('safeAreaInsets', genRequestInsets('safe-area')),
          TE.bindW('contentSafeAreaInsets', genRequestInsets('content-safe-area')),
          TE.bindW('isFullscreen', genFlag(isFullscreen)),
          TE.bindW('isViewportStable', genFlag(isViewportStable)),
          TE.chainW(({ isViewportStable, ...shared }) => {
            if (isViewportStable) {
              return TE.right({
                ...shared,
                height: window.innerHeight,
                isExpanded: true,
                stableHeight: window.innerHeight,
                width: window.innerWidth,
              });
            }
            return pipe(
              request('web_app_request_viewport', 'viewport_changed', options),
              TE.map(viewport => ({
                ...shared,
                height: viewport.height,
                isExpanded: viewport.is_expanded,
                stableHeight: viewport.is_state_stable ? viewport.height : 0,
                width: viewport.width,
              })),
            );
          }),
        );
      },
      isPageReload,
      onMounted(state) {
        onViewportChanged(viewportChangedListener);
        onFullscreenChanged(fullscreenChangedListener);
        onSafeAreaInsetsChanged(safeAreaInsetsChangedListener);
        onContentSafeAreaInsetsChanged(contentSafeAreaInsetsChangedListener);
        stateful.setState(state);
      },
      onUnmounted() {
        offViewportChanged(viewportChangedListener);
        offFullscreenChanged(fullscreenChangedListener);
        offSafeAreaInsetsChanged(safeAreaInsetsChangedListener);
        offContentSafeAreaInsetsChanged(contentSafeAreaInsetsChangedListener);
      },
      restoreState: storage.get,
    });

    const saBased = <K extends keyof SafeAreaInsets>(key: K) => {
      return computed(() => this.safeAreaInsets()[key]);
    };
    const csaBased = <K extends keyof SafeAreaInsets>(key: K) => {
      return computed(() => this.contentSafeAreaInsets()[key]);
    };

    this.state = stateful.state;
    this.height = stateful.getter('height');
    this.stableHeight = stateful.getter('stableHeight');
    this.width = stateful.getter('width');
    this.isExpanded = stateful.getter('isExpanded');
    this.safeAreaInsets = stateful.getter('safeAreaInsets');
    this.safeAreaInsetTop = saBased('top');
    this.safeAreaInsetBottom = saBased('bottom');
    this.safeAreaInsetLeft = saBased('left');
    this.safeAreaInsetRight = saBased('right');
    this.contentSafeAreaInsets = stateful.getter('contentSafeAreaInsets');
    this.contentSafeAreaInsetTop = csaBased('top');
    this.contentSafeAreaInsetBottom = csaBased('bottom');
    this.contentSafeAreaInsetLeft = csaBased('left');
    this.contentSafeAreaInsetRight = csaBased('right');

    const wrapTask = createWithChecksFp({ isTma, returns: 'task' });
    const wrapMountedEither = createWithChecksFp({
      isTma,
      returns: 'either',
    });
    const wrapFullscreenTask = createWithChecksFp({
      isTma,
      requires: 'web_app_request_fullscreen',
      version,
      returns: 'task',
    });
    const genFullscreenFn = (enable: boolean) => {
      return wrapFullscreenTask((options?: AsyncOptions) => {
        return pipe(
          request(
            enable ? 'web_app_request_fullscreen' : 'web_app_exit_fullscreen',
            ['fullscreen_changed', 'fullscreen_failed'],
            options,
          ),
          TE.chain(data => {
            if ('error' in data && data.error !== 'ALREADY_FULLSCREEN') {
              return TE.left(new FullscreenFailedError(data.error));
            }
            stateful.setState({ isFullscreen: 'is_fullscreen' in data ? data.is_fullscreen : true });
            return TE.right(undefined);
          }),
        );
      });
    };

    // Mount.
    this.isMounted = mountable.isMounted;
    this.mountFp = wrapTask(mountable.mount);
    this.mount = throwifyWithChecksFp(this.mountFp);

    // Fullscreen.
    this.isFullscreen = stateful.getter('isFullscreen');
    this.requestFullscreenFp = genFullscreenFn(true);
    this.requestFullscreen = throwifyWithChecksFp(this.requestFullscreenFp);
    this.exitFullscreenFp = genFullscreenFn(false);
    this.exitFullscreen = throwifyWithChecksFp(this.exitFullscreenFp);

    // CSS vars.
    const isCssVarsBound = signal(false);
    this.isCssVarsBound = computed(isCssVarsBound);
    this.bindCssVarsFp = wrapMountedEither(
      (getCSSVarName?: GetCSSVarNameFn) => {
        if (isCssVarsBound()) {
          return E.left(new CSSVarsBoundError());
        }
        getCSSVarName ||= prop => `--tg-viewport-${camelToKebab(prop)}`;

        const settings = ([
          ['height', this.height],
          ['stableHeight', this.stableHeight],
          ['width', this.width],
          ['safeAreaInsetTop', this.safeAreaInsetTop],
          ['safeAreaInsetBottom', this.safeAreaInsetBottom],
          ['safeAreaInsetLeft', this.safeAreaInsetLeft],
          ['safeAreaInsetRight', this.safeAreaInsetRight],
          ['contentSafeAreaInsetTop', this.contentSafeAreaInsetTop],
          ['contentSafeAreaInsetBottom', this.contentSafeAreaInsetBottom],
          ['contentSafeAreaInsetLeft', this.contentSafeAreaInsetLeft],
          ['contentSafeAreaInsetRight', this.contentSafeAreaInsetRight],
        ] as const).reduce<{
          update: VoidFunction;
          removeListener: VoidFunction;
          cssVar: string;
        }[]>((acc, [key, signal]) => {
          const cssVar = getCSSVarName(key);
          if (cssVar) {
            const update = () => {
              setCssVar(cssVar, `${signal()}px`);
            };
            acc.push({ update, removeListener: signal.sub(update), cssVar });
          }
          return acc;
        }, []);

        settings.forEach(setting => {
          setting.update();
        });
        isCssVarsBound.set(true);

        return E.right(() => {
          settings.forEach(s => {
            s.removeListener();
            deleteCssVar(s.cssVar);
          });
          isCssVarsBound.set(false);
        });
      },
    );
    this.bindCssVars = throwifyWithChecksFp(this.bindCssVarsFp);

    // Other methods.
    this.expandFp = wrapMountedEither(() => postEvent('web_app_expand'));
    this.expand = throwifyWithChecksFp(this.expandFp);
  }

  //#region Other properties.
  /**
   * Complete component state.
   */
  readonly state: Computed<ViewportState>;

  /**
   * Signal containing the current height of the **visible area** of the Mini App.
   *
   * The application can display just the top part of the Mini App, with its
   * lower part remaining outside the screen area. From this position, the user
   * can "pull" the Mini App to its maximum height, while the bot can do the same
   * by calling `expand` method. As the position of the Mini App changes, the
   * current height value of the visible area will be updated  in real time.
   *
   * Please note that the refresh rate of this value is not sufficient to
   * smoothly follow the lower border of the window. It should not be used to pin
   * interface elements to the bottom of the visible area. It's more appropriate
   * to use the value of the `stableHeight` field for this purpose.
   *
   * @see stableHeight
   */
  readonly height: Computed<number>;

  /**
   * Signal containing the height of the visible area of the Mini App in its last stable state.
   *
   * The application can display just the top part of the Mini App, with its
   * lower part remaining outside the screen area. From this position, the user
   * can "pull" the Mini App to its maximum height, while the application can do
   * the same by calling `expand` method.
   *
   * Unlike the value of `height`, the value of `stableHeight` does not change as
   * the position of the Mini App changes with user gestures or during
   * animations. The value of `stableHeight` will be updated after all gestures
   * and animations are completed and the Mini App reaches its final size.
   *
   * @see height
   */
  readonly stableHeight: Computed<number>;

  /**
   * Signal containing the currently visible area width.
   */
  readonly width: Computed<number>;

  /**
   * Signal indicating if the Mini App is expanded to the maximum available height. Otherwise,
   * if the Mini App occupies part of the screen and can be expanded to the full
   * height using the `expand` method.
   */
  readonly isExpanded: Computed<boolean>;

  /**
   * Signal indicating if the current viewport height is stable and is not going to change in
   * the next moment.
   */
  readonly isStable = computed(() => this.height() === this.stableHeight());
  //#endregion

  //#region Content safe area insets.
  /**
   * Signal containing content safe area insets.
   */
  readonly contentSafeAreaInsets: Computed<SafeAreaInsets>;

  /**
   * Signal containing top content safe area inset.
   */
  readonly contentSafeAreaInsetTop: Computed<number>;

  /**
   * Signal containing left content safe area inset.
   */
  readonly contentSafeAreaInsetLeft: Computed<number>;

  /**
   * Signal containing right content safe area inset.
   */
  readonly contentSafeAreaInsetRight: Computed<number>;

  /**
   * Signal containing bottom content safe area inset.
   */
  readonly contentSafeAreaInsetBottom: Computed<number>;
  //#endregion

  //#region Safe area insets.
  /**
   * Signal containing safe area insets.
   */
  readonly safeAreaInsets: Computed<SafeAreaInsets>;

  /**
   * Signal containing top safe area inset.
   */
  readonly safeAreaInsetTop: Computed<number>;

  /**
   * Signal containing left safe area inset.
   */
  readonly safeAreaInsetLeft: Computed<number>;

  /**
   * Signal containing right safe area inset.
   */
  readonly safeAreaInsetRight: Computed<number>;

  /**
   * Signal containing bottom safe area inset.
   */
  readonly safeAreaInsetBottom: Computed<number>;
  //#endregion

  //#region Fullscreen.
  /**
   * Signal indicating if the viewport is currently in fullscreen mode.
   */
  readonly isFullscreen: Computed<boolean>;

  /**
   * Requests fullscreen mode for the mini application.
   * @since Mini Apps v8.0
   */
  readonly requestFullscreenFp: WithChecksFp<
    (options?: AsyncOptions) => TE.TaskEither<FullscreenError, void>,
    true
  >;

  /**
   * @see requestFullscreenFp
   */
  readonly requestFullscreen: WithChecks<(options?: AsyncOptions) => BetterPromise<void>, true>;

  /**
   * Exits mini application from the fullscreen mode.
   * @since Mini Apps v8.0
   */
  readonly exitFullscreenFp: WithChecksFp<
    (options?: AsyncOptions) => TE.TaskEither<FullscreenError, void>,
    true
  >;

  /**
   * @see exitFullscreenFp
   */
  readonly exitFullscreen: WithChecks<(options?: AsyncOptions) => BetterPromise<void>, true>;
  //#endregion

  //#region CSS Vars.
  /**
   * Signal indicating if CSS variables are bound.
   */
  readonly isCssVarsBound: Computed<boolean>;

  /**
   * Creates CSS variables connected with the current viewport.
   *
   * By default, created CSS variables names are following the pattern "--tg-theme-{name}", where
   * {name} is a viewport property name converted from camel case to kebab case.
   *
   * Default variables:
   * - `--tg-viewport-height`
   * - `--tg-viewport-width`
   * - `--tg-viewport-stable-height`
   * - `--tg-viewport-content-safe-area-inset-top`
   * - `--tg-viewport-content-safe-area-inset-bottom`
   * - `--tg-viewport-content-safe-area-inset-left`
   * - `--tg-viewport-content-safe-area-inset-right`
   * - `--tg-viewport-safe-area-inset-top`
   * - `--tg-viewport-safe-area-inset-bottom`
   * - `--tg-viewport-safe-area-inset-left`
   * - `--tg-viewport-safe-area-inset-right`
   *
   * Variables are being automatically updated if the viewport was changed.
   *
   * @param getCSSVarName - function, returning computed complete CSS variable name. The CSS
   * variable will only be defined if the function returned non-empty string value.
   * @returns Function to stop updating variables.
   * @example Using no arguments
   * bindCssVarsFp();
   * @example Using custom CSS vars generator
   * bindCssVarsFp(key => `--my-prefix-${key}`);
   */
  readonly bindCssVarsFp: WithChecksFp<(getCSSVarName?: GetCSSVarNameFn) => (
    E.Either<CSSVarsBoundError, VoidFunction>
  ), false>;

  /**
   * @see bindCssVarsFp
   */
  readonly bindCssVars: WithChecks<(getCSSVarName?: GetCSSVarNameFn) => VoidFunction, false>;
  //#endregion

  //#region Mount.
  /**
   * Signal indicating if the component is currently mounted.
   */
  readonly isMounted: Computed<boolean>;

  /**
   * Mounts the component.
   */
  readonly mountFp: WithChecksFp<(options?: AsyncOptions) => (
    TE.TaskEither<EFullscreen | EViewportStable | RequestError, void>
  ), false>;

  /**
   * @see mountFp
   */
  readonly mount: WithChecks<(options?: AsyncOptions) => BetterPromise<void>, false>;
  //#endregion

  //#region Other methods.
  /**
   * A method that expands the Mini App to the maximum available height. To find
   * out if the Mini App is expanded to the maximum height, refer to the value of
   * the `isExpanded`.
   */
  readonly expandFp: WithChecksFp<() => E.Either<PostEventError, void>, false>;

  /**
   * @see expandFp
   */
  readonly expand: WithChecks<() => void, false>;
  //#endregion
}
