import { TimeoutError, UnknownEnvError } from './errors.js';
import { retrieveRawLaunchParams } from './launch-params.js';
import { request } from './request.js';

/**
 * Window properties used by the Telegram clients and the official SDK to communicate with
 * a mini app.
 */
export interface TelegramWindow {
  /**
   * Telegram for iOS, macOS, Android and Telegram Desktop.
   */
  TelegramWebviewProxy?: {
    postEvent: (eventType: string, eventData: string) => void;
  };
  /**
   * Telegram for Windows Phone.
   */
  external?: {
    notify?: (message: string) => void;
  };
  Telegram?: {
    WebView?: {
      receiveEvent?: ReceiveEventFn;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  TelegramGameProxy?: {
    receiveEvent?: ReceiveEventFn;
    [key: string]: unknown;
  };
  TelegramGameProxy_receiveEvent?: ReceiveEventFn;
}

export type ReceiveEventFn = (eventType: string, eventData?: unknown) => void;

/**
 * @returns The current window with Telegram-specific properties typed.
 */
export function telegramWindow(): Window & TelegramWindow {
  return window;
}

/**
 * @returns True if the current environment is an iframe. Telegram Web clients open mini apps
 * in an iframe.
 * @see https://stackoverflow.com/a/326076
 */
export function isIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * @returns True if the `window.TelegramWebviewProxy.postEvent` function exists. Native Telegram
 * clients define it to receive method calls.
 */
export function hasWebviewProxy(): boolean {
  return typeof telegramWindow().TelegramWebviewProxy?.postEvent === 'function';
}

/**
 * @returns True if the current environment looks like a Telegram Mini App: the Telegram webview
 * proxy is defined, or launch parameters are available.
 *
 * Use `isTMAAsync` for a stricter check.
 */
export function isTMA(): boolean {
  if (hasWebviewProxy()) {
    return true;
  }
  try {
    retrieveRawLaunchParams();
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if the current environment is a Telegram Mini App by calling a method and waiting for
 * the Telegram client response.
 * @param options - additional options.
 */
export async function isTMAAsync(options: {
  /**
   * Time in milliseconds to wait for the response.
   * @default 100
   */
  timeout?: number;
  /**
   * Signal to abort the check.
   */
  signal?: AbortSignal;
} = {}): Promise<boolean> {
  if (hasWebviewProxy()) {
    return true;
  }
  try {
    await request('web_app_request_theme', 'theme_changed', { timeout: 100, ...options });
    return true;
  } catch (e) {
    if (TimeoutError.is(e) || UnknownEnvError.is(e)) {
      return false;
    }
    throw e;
  }
}
