import {
  err,
  type InvoiceStatus,
  ok,
  type Result,
  safeRequest,
  throwing,
  type TimeoutError,
} from '@tma.js/bridge';

import { ConcurrentCallError, InvalidArgumentsError } from '../../errors.js';
import { isTelegramHostname } from '../../functions/links/links.js';
import { isMethodSupported, requireMethod } from '../../globals.js';
import { type Computed, createStore, computedFromStore } from '../../store.js';
import type { AsyncOptions } from '../../types.js';

/**
 * @since Mini Apps v6.1
 */
export interface Invoice {
  /**
   * True if an invoice is opened.
   */
  isOpened: Computed<boolean>;
  /**
   * @returns True if the SDK is initialized and invoices are supported.
   */
  isSupported: () => boolean;
  /**
   * Throwing version of `safeOpenSlug`.
   * @throws {TimeoutError} The invoice was not closed in time.
   */
  openSlug: (slug: string, options?: AsyncOptions) => Promise<InvoiceStatus>;
  /**
   * Throwing version of `safeOpenUrl`.
   * @throws {InvalidArgumentsError} The URL is not an invoice link.
   * @throws {TimeoutError} The invoice was not closed in time.
   */
  openUrl: (url: string, options?: AsyncOptions) => Promise<InvoiceStatus>;
  /**
   * Opens an invoice by its slug and waits until it is closed.
   * @param slug - invoice slug.
   * @param options - additional options.
   * @returns Invoice status, or `TimeoutError` if the invoice was not closed in time.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {MethodUnsupportedError} Invoices are unsupported.
   * @throws {ConcurrentCallError} An invoice is already opened.
   */
  safeOpenSlug: (
    slug: string,
    options?: AsyncOptions,
  ) => Promise<Result<TimeoutError, InvoiceStatus>>;
  /**
   * Opens an invoice by its URL and waits until it is closed.
   * @param url - invoice URL in the format `https://t.me/invoice/{slug}` or
   * `https://t.me/${slug}`.
   * @param options - additional options.
   * @returns Invoice status, `InvalidArgumentsError` if the URL is not an invoice link, or
   * `TimeoutError` if the invoice was not closed in time.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {MethodUnsupportedError} Invoices are unsupported.
   * @throws {ConcurrentCallError} An invoice is already opened.
   */
  safeOpenUrl: (
    url: string,
    options?: AsyncOptions,
  ) => Promise<Result<InvalidArgumentsError | TimeoutError, InvoiceStatus>>;
}

const METHOD = 'web_app_open_invoice';

/**
 * @internal
 */
export function createInvoice(): Invoice {
  const isOpened = createStore(false);

  const safeOpenSlug: Invoice['safeOpenSlug'] = async (slug, options) => {
    const { postEvent } = requireMethod(METHOD);
    if (isOpened.get()) {
      throw new ConcurrentCallError('An invoice is already opened');
    }
    isOpened.set(true);
    try {
      const response = await safeRequest(METHOD, 'invoice_closed', {
        ...options,
        capture: payload => payload.slug === slug,
        params: { slug },
        postEvent,
      });
      return response.ok ? ok(response.data.status) : response;
    } finally {
      isOpened.set(false);
    }
  };

  const safeOpenUrl: Invoice['safeOpenUrl'] = async (url, options) => {
    requireMethod(METHOD);
    let parsed: URL;
    try {
      parsed = new URL(url, window.location.href);
    } catch (e) {
      return err(new InvalidArgumentsError(`Invalid URL: ${url}`, e));
    }
    if (!isTelegramHostname(parsed.hostname)) {
      return err(new InvalidArgumentsError(`Link has unexpected hostname: ${parsed.hostname}`));
    }
    // Valid pathnames: "/invoice/{slug}" and "/${slug}".
    const match = parsed.pathname.match(/^\/(\$|invoice\/)([\w\-=]+)$/);
    if (!match) {
      return err(new InvalidArgumentsError(
        'Expected a link with a pathname in the format "/invoice/{slug}" or "/${slug}"',
      ));
    }
    return safeOpenSlug(match[2], options);
  };

  return {
    isOpened: computedFromStore(isOpened),
    isSupported: () => isMethodSupported(METHOD),
    openSlug: throwing(safeOpenSlug),
    openUrl: throwing(safeOpenUrl),
    safeOpenSlug,
    safeOpenUrl,
  };
}

/**
 * Telegram invoices.
 * @since Mini Apps v6.1
 */
export const invoice = /* @__PURE__ */ createInvoice();
