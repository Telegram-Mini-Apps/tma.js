import {
  err,
  ok,
  onEvent,
  type Result,
  type SafeAreaInsets,
  safeRequest,
  throwing,
  type TimeoutError,
} from '@tma.js/bridge';

import { createAsyncMount, createComponentCore } from '../../component.js';
import { createCSSVarsBinding, toKebab } from '../../css-vars.js';
import { FullscreenFailedError } from '../../errors.js';
import { getGlobals, isMethodSupported, requireMethod } from '../../globals.js';
import { combineSubscribe } from '../../store.js';
import type { AsyncOptions, MountableComponent, StatefulComponent } from '../../types.js';

export interface ViewportState {
  /**
   * Insets of the safe area free from Telegram UI elements, e.g. the header in fullscreen mode.
   */
  contentSafeAreaInsets: SafeAreaInsets;
  /**
   * Current viewport height. It changes while the user is dragging the mini app.
   */
  height: number;
  isExpanded: boolean;
  isFullscreen: boolean;
  /**
   * Insets of the safe area free from device elements, e.g. a notch.
   */
  safeAreaInsets: SafeAreaInsets;
  /**
   * Viewport height in its last stable state.
   */
  stableHeight: number;
  width: number;
}

type InsetKey = `${'safeAreaInset' | 'contentSafeAreaInset'}${'Top' | 'Bottom' | 'Left' | 'Right'}`;

export type ViewportCSSVarKey = 'height' | 'width' | 'stableHeight' | InsetKey;

export interface Viewport extends StatefulComponent<ViewportState>, MountableComponent {
  height: () => number;
  stableHeight: () => number;
  width: () => number;
  isExpanded: () => boolean;
  isFullscreen: () => boolean;
  safeAreaInsets: () => SafeAreaInsets;
  contentSafeAreaInsets: () => SafeAreaInsets;
  /**
   * @returns True if the component is mounting.
   */
  isMounting: () => boolean;
  /**
   * Mounts the component. If the page was reloaded, the state saved before the reload is
   * restored. Otherwise, the viewport is requested from the Telegram client. Each call
   * retrieves the state independently.
   * @param options - additional options.
   * @returns `TimeoutError` if the Telegram client didn't respond in time.
   * @throws {NotInitializedError} The SDK is not initialized.
   */
  safeMount: (options?: AsyncOptions) => Promise<Result<TimeoutError, void>>;
  /**
   * Throwing version of `safeMount`.
   * @param options - additional options.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {TimeoutError} The Telegram client didn't respond in time.
   */
  mount: (options?: AsyncOptions) => Promise<void>;
  /**
   * Expands the mini app to the maximum available height.
   * @throws {NotInitializedError} The SDK is not initialized.
   */
  expand: () => void;
  /**
   * @returns True if the SDK is initialized and fullscreen mode is supported.
   * @since Mini Apps v8.0
   */
  isFullscreenSupported: () => boolean;
  /**
   * Requests fullscreen mode.
   * @param options - additional options.
   * @returns `FullscreenFailedError` if the Telegram client failed to enter fullscreen mode,
   * or `TimeoutError` if it didn't respond in time.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {MethodUnsupportedError} Fullscreen mode is unsupported.
   * @since Mini Apps v8.0
   */
  safeRequestFullscreen: (
    options?: AsyncOptions,
  ) => Promise<Result<FullscreenFailedError | TimeoutError, void>>;
  /**
   * Throwing version of `safeRequestFullscreen`.
   * @throws {FullscreenFailedError} The Telegram client failed to enter fullscreen mode.
   * @throws {TimeoutError} The Telegram client didn't respond in time.
   * @since Mini Apps v8.0
   */
  requestFullscreen: (options?: AsyncOptions) => Promise<void>;
  /**
   * Exits fullscreen mode.
   * @param options - additional options.
   * @returns `FullscreenFailedError` if the Telegram client failed to exit fullscreen mode,
   * or `TimeoutError` if it didn't respond in time.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {MethodUnsupportedError} Fullscreen mode is unsupported.
   * @since Mini Apps v8.0
   */
  safeExitFullscreen: (
    options?: AsyncOptions,
  ) => Promise<Result<FullscreenFailedError | TimeoutError, void>>;
  /**
   * Throwing version of `safeExitFullscreen`.
   * @throws {FullscreenFailedError} The Telegram client failed to exit fullscreen mode.
   * @throws {TimeoutError} The Telegram client didn't respond in time.
   * @since Mini Apps v8.0
   */
  exitFullscreen: (options?: AsyncOptions) => Promise<void>;
  /**
   * @returns True if CSS variables are bound.
   */
  isCssVarsBound: () => boolean;
  /**
   * Creates CSS variables reflecting the viewport in pixels. By default, variables are named
   * `--tg-viewport-{key}`, where `{key}` is in kebab case, e.g. `--tg-viewport-stable-height` or
   * `--tg-viewport-safe-area-inset-top`.
   * @param getName - function returning a CSS variable name for the key. If it returns a falsy
   * value, the variable is not created.
   * @returns Function removing the variables.
   * @throws {NotMountedError} The component is not mounted.
   * @throws {CSSVarsBoundError} CSS variables are already bound.
   */
  bindCssVars: (
    getName?: (key: ViewportCSSVarKey) => string | null | undefined | false,
  ) => VoidFunction;
}

/**
 * Platforms with a viewport which is always stable and expanded.
 */
const STABLE_PLATFORMS = ['macos', 'tdesktop', 'unigram', 'webk', 'weba', 'web'];

const NO_INSETS: SafeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 };

/**
 * @internal
 */
export function createViewport(): Viewport {
  const core = createComponentCore<ViewportState>('viewport', {
    contentSafeAreaInsets: NO_INSETS,
    height: 0,
    isExpanded: false,
    isFullscreen: false,
    safeAreaInsets: NO_INSETS,
    stableHeight: 0,
    width: 0,
  });
  const { state } = core;
  let cleanups: VoidFunction[] = [];

  const requestInsets = async (
    kind: 'safe' | 'content',
    options?: AsyncOptions,
  ): Promise<Result<TimeoutError, SafeAreaInsets>> => {
    const [method, event] = kind === 'safe'
      ? ['web_app_request_safe_area', 'safe_area_changed'] as const
      : ['web_app_request_content_safe_area', 'content_safe_area_changed'] as const;
    return isMethodSupported(method)
      ? safeRequest(method, event, { ...options, postEvent: getGlobals().postEvent })
      : ok(NO_INSETS);
  };

  const retrieveState = async (
    options?: AsyncOptions,
  ): Promise<Result<TimeoutError, ViewportState>> => {
    const { launchParams, postEvent } = getGlobals();
    const [safeAreaInsets, contentSafeAreaInsets, viewport] = await Promise.all([
      requestInsets('safe', options),
      requestInsets('content', options),
      STABLE_PLATFORMS.includes(launchParams.tgWebAppPlatform)
        ? ok({
          height: window.innerHeight,
          width: window.innerWidth,
          is_expanded: true,
          is_state_stable: true,
        })
        : safeRequest('web_app_request_viewport', 'viewport_changed', { ...options, postEvent }),
    ]);
    if (!safeAreaInsets.ok) {
      return safeAreaInsets;
    }
    if (!contentSafeAreaInsets.ok) {
      return contentSafeAreaInsets;
    }
    if (!viewport.ok) {
      return viewport;
    }
    const { height, width, is_expanded, is_state_stable } = viewport.data;
    return ok({
      contentSafeAreaInsets: contentSafeAreaInsets.data,
      height,
      isExpanded: is_expanded,
      isFullscreen: !!launchParams.tgWebAppFullscreen,
      safeAreaInsets: safeAreaInsets.data,
      stableHeight: is_state_stable ? height : 0,
      width,
    });
  };

  const listen = () => {
    cleanups = [
      onEvent('viewport_changed', ({ height, width, is_expanded, is_state_stable }) => {
        state.update({
          height,
          width,
          isExpanded: is_expanded,
          ...is_state_stable ? { stableHeight: height } : {},
        });
      }),
      onEvent('fullscreen_changed', ({ is_fullscreen }) => {
        state.update({ isFullscreen: is_fullscreen });
      }),
      onEvent('safe_area_changed', safeAreaInsets => state.update({ safeAreaInsets })),
      onEvent('content_safe_area_changed', contentSafeAreaInsets => {
        state.update({ contentSafeAreaInsets });
      }),
    ];
  };

  const asyncMount = createAsyncMount(core, retrieveState, listen);
  const { mounting } = asyncMount;
  const safeMount = async (options?: AsyncOptions) => {
    getGlobals();
    return asyncMount.safeMount(options);
  };

  const safeFullscreen = (enable: boolean) => async (
    options?: AsyncOptions,
  ): Promise<Result<FullscreenFailedError | TimeoutError, void>> => {
    const method = enable ? 'web_app_request_fullscreen' : 'web_app_exit_fullscreen';
    const { postEvent } = requireMethod(method);
    const response = await safeRequest(method, ['fullscreen_changed', 'fullscreen_failed'], {
      ...options,
      postEvent,
    });
    if (!response.ok) {
      return response;
    }
    const { data } = response;
    if (data.event === 'fullscreen_changed') {
      state.update({ isFullscreen: data.payload.is_fullscreen });
      return ok(undefined);
    }
    if (data.payload.error === 'ALREADY_FULLSCREEN') {
      state.update({ isFullscreen: true });
      return ok(undefined);
    }
    return err(new FullscreenFailedError(data.payload.error));
  };
  const safeRequestFullscreen = safeFullscreen(true);
  const safeExitFullscreen = safeFullscreen(false);

  const px = (value: number) => `${value}px`;
  const cssVars = createCSSVarsBinding<ViewportCSSVarKey>(() => {
    const { height, width, stableHeight, safeAreaInsets, contentSafeAreaInsets } = state.get();
    const values: Partial<Record<ViewportCSSVarKey, string>> = {
      height: px(height),
      width: px(width),
      stableHeight: px(stableHeight),
    };
    (['Top', 'Bottom', 'Left', 'Right'] as const).forEach(side => {
      const key = side.toLowerCase() as keyof SafeAreaInsets;
      values[`safeAreaInset${side}`] = px(safeAreaInsets[key]);
      values[`contentSafeAreaInset${side}`] = px(contentSafeAreaInsets[key]);
    });
    return values;
  }, state.subscribe);

  return {
    height: () => state.get().height,
    stableHeight: () => state.get().stableHeight,
    width: () => state.get().width,
    isExpanded: () => state.get().isExpanded,
    isFullscreen: () => state.get().isFullscreen,
    safeAreaInsets: () => state.get().safeAreaInsets,
    contentSafeAreaInsets: () => state.get().contentSafeAreaInsets,
    state: state.get,
    subscribe: combineSubscribe(core.subscribe, mounting.subscribe, cssVars.bound.subscribe),
    isMounted: core.mounted.get,
    isMounting: mounting.get,
    safeMount,
    mount: throwing(safeMount),
    unmount() {
      asyncMount.cancel();
      if (core.unmount()) {
        cleanups.forEach(cleanup => cleanup());
      }
    },
    expand() {
      getGlobals().postEvent('web_app_expand');
    },
    isFullscreenSupported: () => isMethodSupported('web_app_request_fullscreen'),
    safeRequestFullscreen,
    requestFullscreen: throwing(safeRequestFullscreen),
    safeExitFullscreen,
    exitFullscreen: throwing(safeExitFullscreen),
    isCssVarsBound: cssVars.bound.get,
    bindCssVars(getName = key => `--tg-viewport-${toKebab(key)}`) {
      core.assertMounted();
      return cssVars.bind(getName);
    },
  };
}

/**
 * The mini app viewport: its size, safe areas and fullscreen mode.
 */
export const viewport = /* @__PURE__ */ createViewport();
