import {
  createPostEvent,
  getLogger,
  isIframe,
  type LaunchParams,
  type LaunchParamsRetrieveError,
  ok,
  onEvent,
  type PostEventFn,
  type Result,
  safeRetrieveLaunchParams,
  throwing,
} from '@tma.js/bridge';

import { setGlobals } from './globals.js';

/**
 * Cleanup of the previous `init` call.
 */
let cleanupPrevious: VoidFunction | undefined;

export interface InitOptions {
  /**
   * Apply styles sent by Telegram Web clients.
   * @default true
   */
  acceptCustomStyles?: boolean;
  /**
   * Launch parameters to use.
   * @default Launch parameters retrieved with the `retrieveLaunchParams` function.
   */
  launchParams?: LaunchParams;
  /**
   * Function calling Mini Apps methods.
   * @default A function created with `createPostEvent` for the current Mini Apps version. It
   * throws `MethodUnsupportedError` and `MethodParameterUnsupportedError` on unsupported calls.
   */
  postEvent?: PostEventFn;
}

/**
 * Initializes the SDK. It saves launch parameters and the `postEvent` function to use across
 * the package, and starts handling Telegram Web clients' events.
 * @param options - additional options.
 * @returns Function removing the added event listeners and styles, or
 * `LaunchParamsRetrieveError` if launch parameters were not passed and not found.
 */
export function safeInit(
  options: InitOptions = {},
): Result<LaunchParamsRetrieveError, VoidFunction> {
  let { launchParams } = options;
  if (!launchParams) {
    const retrieved = safeRetrieveLaunchParams();
    if (!retrieved.ok) {
      return retrieved;
    }
    launchParams = retrieved.data;
  }
  const version = launchParams.tgWebAppVersion;
  const postEvent = options.postEvent || createPostEvent(version);
  setGlobals({ launchParams, postEvent, version });
  cleanupPrevious?.();

  const cleanups: VoidFunction[] = [];
  // Telegram Web clients run mini apps in an iframe and communicate with them using these
  // events. Native clients never send them.
  if (isIframe()) {
    cleanups.push(onEvent('reload_iframe', () => {
      getLogger().log('Received a request to reload the page');
      postEvent('iframe_will_reload');
      window.location.reload();
    }));

    if (options.acceptCustomStyles !== false) {
      const style = document.createElement('style');
      style.id = 'telegram-custom-styles';
      document.head.appendChild(style);
      cleanups.push(
        onEvent('set_custom_style', html => {
          // Style elements don't execute scripts, so assigning the content sent by Telegram is
          // safe.
          style.textContent = html;
        }),
        () => style.remove(),
      );
    }
    // Asks the Telegram Web client to send custom styles and the "reload_iframe" event.
    postEvent('iframe_ready', { reload_supported: true });
  }

  const cleanup = () => {
    cleanups.splice(0).forEach(fn => fn());
    cleanupPrevious === cleanup && (cleanupPrevious = undefined);
  };
  cleanupPrevious = cleanup;
  return ok(cleanup);
}

/**
 * Initializes the SDK. It saves launch parameters and the `postEvent` function to use across
 * the package, and starts handling Telegram Web clients' events.
 *
 * Throwing version of `safeInit`.
 * @param options - additional options.
 * @returns Function removing the added event listeners and styles.
 * @throws {LaunchParamsRetrieveError} Launch parameters were not passed and not found.
 */
export const init = /* @__PURE__ */ throwing(safeInit);
