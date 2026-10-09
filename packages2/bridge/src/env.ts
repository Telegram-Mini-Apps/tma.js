import { telegramWindow } from './globals.js';

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
