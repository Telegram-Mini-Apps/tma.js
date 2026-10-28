import {
  captureSameReq,
  createRequestId,
  ok,
  type Result,
  safeRequest,
  type TimeoutError,
} from '@tma.js/bridge';

import { isMethodSupported, requireMethod } from '../../globals.js';
import { throwingWithIsSupported, withIsSupported } from '../../is-supported.js';
import type { AsyncOptions } from '../../types.js';

/**
 * Copies the text to the clipboard. It doesn't require the SDK to be initialized.
 * @param text - text to copy.
 */
export async function copyTextToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard) {
      return await navigator.clipboard.writeText(text);
    }
  } catch {
    // Falling back to the legacy way.
  }
  const textArea = document.createElement('textarea');
  textArea.value = text;
  // Avoid scrolling to the bottom.
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } finally {
    textArea.remove();
  }
}

/**
 * Reads text from the clipboard.
 *
 * Call it only in response to the user interaction.
 * @param options - additional options.
 * @returns Clipboard text, or `null` if the clipboard contains no text or the access was not
 * granted. `TimeoutError` if the Telegram client didn't respond in time.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @since Mini Apps v6.4
 */
export const safeReadTextFromClipboard = /* @__PURE__ */ withIsSupported(
  async function(
    options?: AsyncOptions,
  ): Promise<Result<TimeoutError, string | null>> {
    const { postEvent } = requireMethod('web_app_read_text_from_clipboard');
    const reqId = createRequestId();
    const response = await safeRequest(
      'web_app_read_text_from_clipboard',
      'clipboard_text_received',
      { ...options, capture: captureSameReq(reqId), params: { req_id: reqId }, postEvent },
    );
    return response.ok ? ok(response.data.data ?? null) : response;
  },
  () => isMethodSupported('web_app_read_text_from_clipboard'),
);

/**
 * Reads text from the clipboard.
 *
 * Throwing version of `safeReadTextFromClipboard`.
 * @param options - additional options.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @throws {TimeoutError} The Telegram client didn't respond in time.
 * @since Mini Apps v6.4
 */
export const readTextFromClipboard = /* @__PURE__ */ throwingWithIsSupported(
  safeReadTextFromClipboard,
);
