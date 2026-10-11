import { err, type InvokeCustomMethodFailedError, ok, type Result, safeInvokeCustomMethod, type TimeoutError } from '@tma.js/bridge';

import { InvalidResponseError } from '../../errors.js';
import { isMethodSupported, requireMethod } from '../../globals.js';
import { throwingWithIsSupported, withIsSupported } from '../../is-supported.js';
import type { AsyncOptions } from '../../types.js';

/**
 * @param options - additional options.
 * @returns The current Telegram server time, `InvokeCustomMethodFailedError` if the Telegram
 * client failed to get it, `TimeoutError` if it didn't respond in time, or
 * `InvalidResponseError` if it responded with an unexpected value.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @since Mini Apps v6.9
 */
export const safeGetCurrentTime = /* @__PURE__ */ withIsSupported(
  async function(
    options?: AsyncOptions,
  ): Promise<Result<InvalidResponseError | InvokeCustomMethodFailedError | TimeoutError, Date>> {
    const { postEvent } = requireMethod('web_app_invoke_custom_method');
    const response = await safeInvokeCustomMethod('getCurrentTime', {}, { ...options, postEvent });
    if (!response.ok) {
      return response;
    }
    const { data } = response;
    return typeof data === 'number' && Number.isInteger(data)
      ? ok(new Date(data * 1000))
      : err(new InvalidResponseError(data));
  },
  () => isMethodSupported('web_app_invoke_custom_method'),
);

/**
 * Throwing version of `safeGetCurrentTime`.
 * @param options - additional options.
 * @returns The current Telegram server time.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @throws {InvokeCustomMethodFailedError} The Telegram client failed to get the time.
 * @throws {TimeoutError} The Telegram client didn't respond in time.
 * @throws {InvalidResponseError} The Telegram client responded with an unexpected value.
 * @since Mini Apps v6.9
 */
export const getCurrentTime = /* @__PURE__ */ throwingWithIsSupported(safeGetCurrentTime);
