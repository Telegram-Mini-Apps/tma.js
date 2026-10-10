import { err, ok, type Result } from '@tma.js/bridge';

import { InvalidArgumentsError } from '../../errors.js';
import { getGlobals, isInitialized } from '../../globals.js';
import { throwingWithIsSupported, withIsSupported } from '../../is-supported.js';

/**
 * Sends data to the bot and closes the mini app. The bot receives a service message with
 * the `web_app_data` field.
 *
 * Available only for mini apps launched via a keyboard button.
 * @param data - data to send, 1-4096 bytes.
 * @returns `InvalidArgumentsError` if the data is empty or too long.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @see https://core.telegram.org/bots/api#message
 */
export const safeSendData = /* @__PURE__ */ withIsSupported(
  function(data: string): Result<InvalidArgumentsError, void> {
    const { postEvent } = getGlobals();
    const { size } = new Blob([data]);
    if (!size || size > 4096) {
      return err(new InvalidArgumentsError(size
        ? 'Maximum size of data to send is 4096 bytes'
        : 'Attempted to send empty data'));
    }
    postEvent('web_app_data_send', { data });
    return ok(undefined);
  },
  isInitialized,
);

/**
 * Sends data to the bot and closes the mini app.
 *
 * Throwing version of `safeSendData`.
 * @param data - data to send, 1-4096 bytes.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {InvalidArgumentsError} The data is empty or too long.
 */
export const sendData = /* @__PURE__ */ throwingWithIsSupported(safeSendData);
