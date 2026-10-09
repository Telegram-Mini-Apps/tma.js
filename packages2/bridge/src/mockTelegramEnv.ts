import { safeParse } from 'valibot';

import { isIframe } from './env.js';
import { miniAppsMessage } from './events.js';
import { telegramWindow, type TelegramWindow } from './globals.js';
import {
  parseLaunchParams,
  saveLaunchParams,
  serializeLaunchParams,
  type LaunchParams,
} from './launch-params.js';
import { debugLog } from './logger.js';
import { getPostMessage, setPostMessage } from './postEvent.js';
import type { MethodName, MethodParams } from './types/index.js';

/**
 * Mini Apps method call intercepted by `mockTelegramEnv`.
 */
export type MockedMethodCall =
  | {
    [M in MethodName]: {
      name: M;
      params: [MethodParams<M>] extends [never] ? undefined : MethodParams<M>;
    };
  }[MethodName]
  | { name: string & {}; params: unknown };

export interface MockTelegramEnvOptions {
  /**
   * Launch parameters to mock. They are saved in the session storage, so the launch parameters
   * retrieving functions return them.
   */
  launchParams?: string | URLSearchParams | LaunchParams;
  /**
   * Function called whenever the mini app calls a Mini Apps method. Use `emitEvent` to respond
   * to the call as the Telegram client would do.
   * @param call - called method name and its parameters.
   * @param next - function passing the call to the original transport, if there is one.
   */
  onMethod?: (call: MockedMethodCall, next: VoidFunction) => void;
}

/**
 * Mocks the environment to imitate the Telegram client.
 *
 * Use it to develop the app outside Telegram, or to intercept method calls in Telegram, for
 * example, to fix a client not responding to some method.
 *
 * Outside iframes, calls are intercepted by defining `window.TelegramWebviewProxy`, so method
 * calls performed by other libraries (e.g. the official SDK) are intercepted too. In Telegram Web
 * (iframe), only calls performed by this package are intercepted.
 * @param options - mock options.
 * @returns Function reverting the mocked method calls handling. Launch parameters stay saved.
 * When mocking several times, revert in the reverse order.
 * @example
 * mockTelegramEnv({
 *   launchParams: {
 *     tgWebAppPlatform: 'tdesktop',
 *     tgWebAppVersion: '9.0',
 *     tgWebAppThemeParams: { bg_color: '#ffffff' },
 *   },
 *   onMethod({ name }) {
 *     if (name === 'web_app_request_theme') {
 *       emitEvent('theme_changed', { theme_params: { bg_color: '#ffffff' } });
 *     }
 *   },
 * });
 */
export function mockTelegramEnv(
  { launchParams, onMethod }: MockTelegramEnvOptions = {},
): VoidFunction {
  if (launchParams) {
    const query = typeof launchParams === 'string' || launchParams instanceof URLSearchParams
      ? launchParams.toString()
      : serializeLaunchParams(launchParams);
    // Throws if the launch parameters are invalid.
    parseLaunchParams(query);
    saveLaunchParams(query);
  }

  if (isIframe()) {
    // In Telegram Web, without a handler, there is nothing to intercept.
    if (!onMethod) {
      return () => undefined;
    }
    const original = getPostMessage();
    return setPostMessage((message, targetOrigin) => {
      const next = () => original(message, targetOrigin);
      const call = safeParse(miniAppsMessage, message);
      if (!call.success) {
        return next();
      }
      onMethod({
        name: call.output.eventType,
        params: normalizeParams(call.output.eventData),
      }, next);
    });
  }

  const w = telegramWindow();
  const original = w.TelegramWebviewProxy;
  const proxy: TelegramWindow['TelegramWebviewProxy'] = {
    postEvent(eventType, eventData) {
      const next = () => original && original.postEvent(eventType, eventData);
      onMethod
        ? onMethod({
          name: eventType,
          params: normalizeParams(eventData ? JSON.parse(eventData) : undefined),
        }, next)
        : next();
    },
  };
  w.TelegramWebviewProxy = proxy;
  debugLog('Environment was mocked');

  return () => {
    if (w.TelegramWebviewProxy === proxy) {
      original ? (w.TelegramWebviewProxy = original) : delete w.TelegramWebviewProxy;
    }
  };
}

/**
 * The official SDK and this package pass an empty string for methods without parameters.
 */
function normalizeParams(value: unknown): unknown {
  return value === '' ? undefined : value;
}
