import { err, ok, type OpenLinkBrowser, type Result } from '@tma.js/bridge';

import { InvalidArgumentsError } from '../../errors.js';
import { getGlobals, isInitialized, isMethodSupported, isParamSupported } from '../../globals.js';
import { throwingWithIsSupported, withIsSupported } from '../../is-supported.js';

/**
 * @returns True if the hostname belongs to Telegram.
 * @param hostname - hostname to check.
 */
export function isTelegramHostname(hostname: string): boolean {
  return ['t.me', 'telegram.me', 'telegram.dog'].includes(hostname);
}

function safeToURL(url: string | URL): Result<InvalidArgumentsError, URL> {
  try {
    return ok(new URL(url));
  } catch (e) {
    return err(new InvalidArgumentsError(`Invalid URL: ${url.toString()}`, e));
  }
}

export interface OpenLinkOptions {
  /**
   * Preferred browser to open the link in.
   * @since Mini Apps v7.6
   */
  tryBrowser?: OpenLinkBrowser;
  /**
   * Open the link in the Instant View mode, if possible.
   * @since Mini Apps v6.4
   */
  tryInstantView?: boolean;
}

/**
 * Opens a link in an external browser. The mini app is not closed.
 *
 * Call it only in response to the user interaction. Unsupported options are ignored by the
 * Telegram client, use `supports` to check them.
 * @param url - URL to open.
 * @param options - additional options.
 * @returns `InvalidArgumentsError` if the URL is invalid.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @example
 * safeOpenLink('https://google.com', { tryInstantView: true, tryBrowser: 'chrome' });
 * safeOpenLink.supports('tryBrowser'); // true since Mini Apps v7.6
 */
export const safeOpenLink = /* @__PURE__ */ withIsSupported(
  function(
    url: string | URL,
    options: OpenLinkOptions = {},
  ): Result<InvalidArgumentsError, void> {
    const { postEvent } = getGlobals();
    const parsed = safeToURL(url);
    if (!parsed.ok) {
      return parsed;
    }
    postEvent('web_app_open_link', {
      try_browser: options.tryBrowser,
      try_instant_view: options.tryInstantView,
      url: parsed.data.toString(),
    });
    return ok(undefined);
  },
  isInitialized,
  {
    tryBrowser: () => isParamSupported('web_app_open_link', 'try_browser'),
    tryInstantView: () => isParamSupported('web_app_open_link', 'try_instant_view'),
  },
);

/**
 * Opens a link in an external browser. The mini app is not closed.
 *
 * Throwing version of `safeOpenLink`.
 * @param url - URL to open.
 * @param options - additional options.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {InvalidArgumentsError} The URL is invalid.
 */
export const openLink = /* @__PURE__ */ throwingWithIsSupported(safeOpenLink);

export interface OpenTelegramLinkOptions {
  /**
   * Make the Telegram client process the link even if it is already opened.
   */
  forceRequest?: boolean;
}

/**
 * Opens a Telegram link inside the Telegram client. The mini app is closed.
 * @param url - link with the `t.me` hostname.
 * @param options - additional options.
 * @returns `InvalidArgumentsError` if the URL is invalid or is not a Telegram link.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @example
 * safeOpenTelegramLink('https://t.me/heyqbnk');
 */
export const safeOpenTelegramLink = /* @__PURE__ */ withIsSupported(
  function(
    url: string | URL,
    options: OpenTelegramLinkOptions = {},
  ): Result<InvalidArgumentsError, void> {
    const { postEvent } = getGlobals();
    const parsed = safeToURL(url);
    if (!parsed.ok) {
      return parsed;
    }
    const { hostname, pathname, search } = parsed.data;
    if (!isTelegramHostname(hostname)) {
      return err(new InvalidArgumentsError(`URL has disallowed hostname: ${hostname}`));
    }
    const path = pathname + search;
    if (isMethodSupported('web_app_open_tg_link')) {
      postEvent('web_app_open_tg_link', {
        path_full: path,
        ...options.forceRequest ? { force_request: true } : {},
      });
    } else {
      window.location.href = `https://telegram.me${path}`;
    }
    return ok(undefined);
  },
  isInitialized,
);

/**
 * Opens a Telegram link inside the Telegram client. The mini app is closed.
 *
 * Throwing version of `safeOpenTelegramLink`.
 * @param url - link with the `t.me` hostname.
 * @param options - additional options.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {InvalidArgumentsError} The URL is invalid or is not a Telegram link.
 */
export const openTelegramLink = /* @__PURE__ */ throwingWithIsSupported(safeOpenTelegramLink);

/**
 * Asks the user to choose chats and shares the URL with them. The mini app is closed.
 * @param url - URL to share.
 * @param text - text to append after the URL.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @see https://core.telegram.org/api/links#share-links
 */
export const shareURL = /* @__PURE__ */ withIsSupported(
  function(url: string, text?: string): void {
    // The order defines the query, keep "url" first as the official SDK does.
    // eslint-disable-next-line perfectionist/sort-objects
    const query = new URLSearchParams({ url, text: text || '' })
      .toString()
      // Telegram processes "+" incorrectly, so spaces are encoded with "%20".
      .replace(/\+/g, '%20');
    openTelegramLink(`https://t.me/share/url?${query}`);
  },
  isInitialized,
);
