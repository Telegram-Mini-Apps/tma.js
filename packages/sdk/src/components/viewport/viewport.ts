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

import type { SafeFullscreenFn, Viewport, ViewportCSSVarKey, ViewportState } from './types.js';
import { createAsyncMount, createComponentCore } from '../../component.js';
import { createCSSVarsBinding, toKebab } from '../../css-vars.js';
import { FullscreenFailedError } from '../../errors.js';
import { getGlobals, isMethodSupported, requireMethod } from '../../globals.js';
import { throwingWithIsSupported, withIsSupported } from '../../is-supported.js';
import { computedFromStore, computedPick } from '../../store.js';
import type { AsyncOptions } from '../../types.js';

/**
 * Platforms with a viewport which is always stable and expanded.
 */
const STABLE_PLATFORMS = ['macos', 'tdesktop', 'unigram', 'webk', 'weba', 'web'];

const NO_INSETS: SafeAreaInsets = { bottom: 0, left: 0, right: 0, top: 0 };

/**
 * @internal
 */
export function createViewport(): Viewport {
  const core = createComponentCore<ViewportState>('viewport', {
    contentSafeAreaInsets: NO_INSETS,
    height: 0,
    isExpanded: false,
    isFullscreen: false,
    isStable: false,
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
          is_expanded: true,
          is_state_stable: true,
          width: window.innerWidth,
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
    const { height, is_expanded, is_state_stable, width } = viewport.data;
    return ok({
      contentSafeAreaInsets: contentSafeAreaInsets.data,
      height,
      isExpanded: is_expanded,
      isFullscreen: !!launchParams.tgWebAppFullscreen,
      isStable: is_state_stable,
      safeAreaInsets: safeAreaInsets.data,
      stableHeight: is_state_stable ? height : 0,
      width,
    });
  };

  const listen = () => {
    cleanups = [
      onEvent('viewport_changed', ({ height, is_expanded, is_state_stable, width }) => {
        state.update({
          height,
          isExpanded: is_expanded,
          isStable: is_state_stable,
          width,
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

  const safeFullscreen = (
    method: 'web_app_request_fullscreen' | 'web_app_exit_fullscreen',
  ) => withIsSupported<SafeFullscreenFn>(async options => {
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
  }, () => isMethodSupported(method));
  const safeRequestFullscreen = safeFullscreen('web_app_request_fullscreen');
  const safeExitFullscreen = safeFullscreen('web_app_exit_fullscreen');

  const px = (value: number) => `${value}px`;
  const cssVars = createCSSVarsBinding<ViewportCSSVarKey>(() => {
    const { contentSafeAreaInsets, height, safeAreaInsets, stableHeight, width } = state.get();
    const values: Partial<Record<ViewportCSSVarKey, string>> = {
      height: px(height),
      stableHeight: px(stableHeight),
      width: px(width),
    };
    (['Top', 'Bottom', 'Left', 'Right'] as const).forEach(side => {
      const key = side.toLowerCase() as keyof SafeAreaInsets;
      values[`safeAreaInset${side}`] = px(safeAreaInsets[key]);
      values[`contentSafeAreaInset${side}`] = px(contentSafeAreaInsets[key]);
    });
    return values;
  }, state.subscribe);

  return {
    bindCssVars(getName = key => `--tg-viewport-${toKebab(key)}`) {
      core.assertMounted();
      return cssVars.bind(getName);
    },
    contentSafeAreaInsets: computedPick(state, 'contentSafeAreaInsets'),
    exitFullscreen: throwingWithIsSupported(safeExitFullscreen),
    expand() {
      getGlobals().postEvent('web_app_expand');
    },
    height: computedPick(state, 'height'),
    isCssVarsBound: computedFromStore(cssVars.bound),
    isExpanded: computedPick(state, 'isExpanded'),
    isFullscreen: computedPick(state, 'isFullscreen'),
    isMounted: computedFromStore(core.mounted),
    isMounting: computedFromStore(mounting),
    isStable: computedPick(state, 'isStable'),
    mount: throwing(safeMount),
    requestFullscreen: throwingWithIsSupported(safeRequestFullscreen),
    safeAreaInsets: computedPick(state, 'safeAreaInsets'),
    safeExitFullscreen,
    safeMount,
    safeRequestFullscreen,
    stableHeight: computedPick(state, 'stableHeight'),
    state: computedFromStore(state),
    unmount() {
      asyncMount.cancel();
      if (core.unmount()) {
        cleanups.forEach(cleanup => cleanup());
      }
    },
    width: computedPick(state, 'width'),
  };
}

/**
 * The mini app viewport: its size, safe areas and fullscreen mode.
 */
export const viewport = /* @__PURE__ */ createViewport();
