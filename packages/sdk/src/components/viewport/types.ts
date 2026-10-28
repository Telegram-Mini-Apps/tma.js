import type { Result, SafeAreaInsets, TimeoutError } from '@tma.js/bridge';

import type { FullscreenFailedError } from '../../errors.js';
import type { WithIsSupported } from '../../is-supported.js';
import type { Computed } from '../../store.js';
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
   * True if the viewport is in a stable state, i.e. the user is not dragging the mini app and
   * the height is not being animated.
   */
  isStable: boolean;
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

export type SafeFullscreenFn = (
  options?: AsyncOptions,
) => Promise<Result<FullscreenFailedError | TimeoutError, void>>;

export interface Viewport extends StatefulComponent<ViewportState>, MountableComponent {
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
  contentSafeAreaInsets: Computed<SafeAreaInsets>;
  /**
   * Throwing version of `safeExitFullscreen`.
   * @throws {FullscreenFailedError} The Telegram client failed to exit fullscreen mode.
   * @throws {TimeoutError} The Telegram client didn't respond in time.
   * @since Mini Apps v8.0
   */
  exitFullscreen: WithIsSupported<(options?: AsyncOptions) => Promise<void>>;
  /**
   * Expands the mini app to the maximum available height.
   * @throws {NotInitializedError} The SDK is not initialized.
   */
  expand: () => void;
  height: Computed<number>;
  /**
   * True if CSS variables are bound.
   */
  isCssVarsBound: Computed<boolean>;
  isExpanded: Computed<boolean>;
  isFullscreen: Computed<boolean>;
  /**
   * True if the component is mounting.
   */
  isMounting: Computed<boolean>;
  isStable: Computed<boolean>;
  /**
   * Throwing version of `safeMount`.
   * @param options - additional options.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {TimeoutError} The Telegram client didn't respond in time.
   */
  mount: (options?: AsyncOptions) => Promise<void>;
  /**
   * Throwing version of `safeRequestFullscreen`.
   * @throws {FullscreenFailedError} The Telegram client failed to enter fullscreen mode.
   * @throws {TimeoutError} The Telegram client didn't respond in time.
   * @since Mini Apps v8.0
   */
  requestFullscreen: WithIsSupported<(options?: AsyncOptions) => Promise<void>>;
  safeAreaInsets: Computed<SafeAreaInsets>;
  /**
   * Exits fullscreen mode.
   * @param options - additional options.
   * @returns `FullscreenFailedError` if the Telegram client failed to exit fullscreen mode,
   * or `TimeoutError` if it didn't respond in time.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {MethodUnsupportedError} Fullscreen mode is unsupported.
   * @since Mini Apps v8.0
   */
  safeExitFullscreen: WithIsSupported<SafeFullscreenFn>;
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
   * Requests fullscreen mode.
   * @param options - additional options.
   * @returns `FullscreenFailedError` if the Telegram client failed to enter fullscreen mode,
   * or `TimeoutError` if it didn't respond in time.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {MethodUnsupportedError} Fullscreen mode is unsupported.
   * @since Mini Apps v8.0
   */
  safeRequestFullscreen: WithIsSupported<SafeFullscreenFn>;
  stableHeight: Computed<number>;
  width: Computed<number>;
}
