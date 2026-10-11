import { err, ok, type Result, safeRequest, type TimeoutError } from '@tma.js/bridge';

import { RequestChatError } from '../../errors.js';
import { isMethodSupported, requireMethod } from '../../globals.js';
import { throwingWithIsSupported, withIsSupported } from '../../is-supported.js';
import type { AsyncOptions } from '../../types.js';

/**
 * Asks the user to choose a chat to share with the mini app.
 * @param requestId - identifier of the prepared keyboard button returned by the bot.
 * @param options - additional options.
 * @returns `RequestChatError` if the chat was not shared, or `TimeoutError` if the user didn't
 * respond in time.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @since Mini Apps v9.6
 */
export const safeRequestChat = /* @__PURE__ */ withIsSupported(
  async function(
    requestId: string,
    options?: AsyncOptions,
  ): Promise<Result<RequestChatError | TimeoutError, void>> {
    const { postEvent } = requireMethod('web_app_request_chat');
    const response = await safeRequest(
      'web_app_request_chat',
      ['requested_chat_sent', 'requested_chat_failed'],
      { ...options, params: { req_id: requestId }, postEvent },
    );
    if (!response.ok) {
      return response;
    }
    const { data } = response;
    return data.event === 'requested_chat_failed'
      ? err(new RequestChatError(data.payload.error))
      : ok(undefined);
  },
  () => isMethodSupported('web_app_request_chat'),
);

/**
 * Asks the user to choose a chat to share with the mini app.
 *
 * Throwing version of `safeRequestChat`.
 * @param requestId - identifier of the prepared keyboard button returned by the bot.
 * @param options - additional options.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @throws {RequestChatError} The chat was not shared.
 * @throws {TimeoutError} The user didn't respond in time.
 * @since Mini Apps v9.6
 */
export const requestChat = /* @__PURE__ */ throwingWithIsSupported(safeRequestChat);
