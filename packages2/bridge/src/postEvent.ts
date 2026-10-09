import { isIframe } from './env.js';
import { UnknownEnvError } from './errors.js';
import { telegramWindow } from './globals.js';
import { debugLog } from './logger.js';
import type { MethodArgs, MethodName } from './types/index.js';

let targetOrigin = 'https://web.telegram.org';

/**
 * Sets the target origin used to post messages to the parent window in Telegram Web clients.
 *
 * You don't need to change it until you know what you are doing.
 * @param origin - target origin. Default: `https://web.telegram.org`.
 */
export function setTargetOrigin(origin: string): void {
  targetOrigin = origin;
}

/**
 * @returns The target origin used to post messages to the parent window.
 */
export function getTargetOrigin(): string {
  return targetOrigin;
}

export type PostMessageFn = (message: string, targetOrigin: string) => void;

let postMessage: PostMessageFn = (message, origin) => {
  window.parent.postMessage(message, origin);
};

/**
 * Replaces the function posting messages to the parent window in Telegram Web clients.
 * @param fn - function to use.
 * @returns Function restoring the previous implementation.
 * @internal
 */
export function setPostMessage(fn: PostMessageFn): VoidFunction {
  const previous = postMessage;
  postMessage = fn;
  return () => {
    postMessage = previous;
  };
}

/**
 * @returns The current function posting messages to the parent window.
 * @internal
 */
export function getPostMessage(): PostMessageFn {
  return postMessage;
}

export type PostEventFn = <M extends MethodName>(method: M, ...args: MethodArgs<M>) => void;

/**
 * Calls a Mini Apps method.
 *
 * Depending on the environment, the method is sent:
 * - via `window.parent.postMessage` in Telegram Web clients;
 * - via `window.TelegramWebviewProxy.postEvent` in Telegram for iOS, macOS, Android and Desktop;
 * - via `window.external.notify` in Telegram for Windows Phone.
 *
 * @param method - method name.
 * @param args - method parameters.
 * @throws {UnknownEnvError} The current environment is not a Telegram Mini App.
 * @see https://docs.telegram-mini-apps.com/platform/methods
 */
export const postEvent: PostEventFn = (method, ...args) => {
  const [params = ''] = args as [unknown?];
  debugLog('Posting method:', method, params);

  const message = JSON.stringify({ eventType: method, eventData: params });

  // Unlike the official SDK, the iframe check goes first. Telegram clients also define
  // TelegramWebviewProxy inside iframes embedded by a mini app, letting them bypass the mini app.
  // Calls must go through the top-level mini app only, so an iframe always posts to its parent.
  if (isIframe()) {
    postMessage(message, targetOrigin);
    return;
  }

  const w = telegramWindow();
  if (w.TelegramWebviewProxy && typeof w.TelegramWebviewProxy.postEvent === 'function') {
    w.TelegramWebviewProxy.postEvent(method, JSON.stringify(params));
    return;
  }
  if (w.external && typeof w.external.notify === 'function') {
    w.external.notify(message);
    return;
  }
  throw new UnknownEnvError();
};
