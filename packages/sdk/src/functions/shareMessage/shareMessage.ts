import { err, ok, type Result, safeRequest, type TimeoutError } from '@tma.js/bridge';

import { ShareMessageError } from '../../errors.js';
import { isMethodSupported, requireMethod } from '../../globals.js';
import { throwingWithIsSupported, withIsSupported } from '../../is-supported.js';
import type { AsyncOptions } from '../../types.js';

/**
 * Asks the user to share a message prepared by the bot.
 * @param messageId - prepared message identifier.
 * @param options - additional options.
 * @returns `ShareMessageError` if the message was not shared, or `TimeoutError` if the user
 * didn't respond in time.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @since Mini Apps v8.0
 * @see https://core.telegram.org/bots/api#savepreparedinlinemessage
 */
export const safeShareMessage = /* @__PURE__ */ withIsSupported(
  async function(
    messageId: string,
    options?: AsyncOptions,
  ): Promise<Result<ShareMessageError | TimeoutError, void>> {
    const { postEvent } = requireMethod('web_app_send_prepared_message');
    const response = await safeRequest(
      'web_app_send_prepared_message',
      ['prepared_message_sent', 'prepared_message_failed'],
      { ...options, params: { id: messageId }, postEvent },
    );
    if (!response.ok) {
      return response;
    }
    const { data } = response;
    return data.event === 'prepared_message_failed'
      ? err(new ShareMessageError(data.payload.error))
      : ok(undefined);
  },
  () => isMethodSupported('web_app_send_prepared_message'),
);

/**
 * Asks the user to share a message prepared by the bot.
 *
 * Throwing version of `safeShareMessage`.
 * @param messageId - prepared message identifier.
 * @param options - additional options.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @throws {ShareMessageError} The message was not shared.
 * @throws {TimeoutError} The user didn't respond in time.
 * @since Mini Apps v8.0
 */
export const shareMessage = /* @__PURE__ */ throwingWithIsSupported(safeShareMessage);
