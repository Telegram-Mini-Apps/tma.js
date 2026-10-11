import {
  type EmojiStatusAccessRequestedStatus,
  err,
  ok,
  type Result,
  safeRequest,
  type TimeoutError,
} from '@tma.js/bridge';

import { SetEmojiStatusError } from '../../errors.js';
import { isMethodSupported, requireMethod } from '../../globals.js';
import { throwingWithIsSupported, withIsSupported } from '../../is-supported.js';
import type { AsyncOptions } from '../../types.js';

/**
 * Requests the permission for the bot to manage the user's emoji status.
 * @param options - additional options.
 * @returns Request status, or `TimeoutError` if the user didn't respond in time.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @since Mini Apps v8.0
 */
export const safeRequestEmojiStatusAccess = /* @__PURE__ */ withIsSupported(
  async function(
    options?: AsyncOptions,
  ): Promise<Result<TimeoutError, EmojiStatusAccessRequestedStatus>> {
    const { postEvent } = requireMethod('web_app_request_emoji_status_access');
    const response = await safeRequest(
      'web_app_request_emoji_status_access',
      'emoji_status_access_requested',
      { ...options, postEvent },
    );
    return response.ok ? ok(response.data.status) : response;
  },
  () => isMethodSupported('web_app_request_emoji_status_access'),
);

/**
 * Requests the permission for the bot to manage the user's emoji status.
 *
 * Throwing version of `safeRequestEmojiStatusAccess`.
 * @param options - additional options.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @throws {TimeoutError} The user didn't respond in time.
 * @since Mini Apps v8.0
 */
export const requestEmojiStatusAccess = /* @__PURE__ */ throwingWithIsSupported(
  safeRequestEmojiStatusAccess,
);

export interface SetEmojiStatusOptions extends AsyncOptions {
  /**
   * Status duration in seconds.
   */
  duration?: number;
}

/**
 * Asks the user to set the custom emoji as their status.
 * @param customEmojiId - custom emoji identifier.
 * @param options - additional options.
 * @returns `SetEmojiStatusError` if the status was not set, or `TimeoutError` if the user didn't
 * respond in time.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @since Mini Apps v8.0
 * @example
 * await safeSetEmojiStatus('5361800828313167608', { duration: 3600 });
 */
export const safeSetEmojiStatus = /* @__PURE__ */ withIsSupported(
  async function(
    customEmojiId: string,
    { duration, ...options }: SetEmojiStatusOptions = {},
  ): Promise<Result<SetEmojiStatusError | TimeoutError, void>> {
    const { postEvent } = requireMethod('web_app_set_emoji_status');
    const response = await safeRequest(
      'web_app_set_emoji_status',
      ['emoji_status_set', 'emoji_status_failed'],
      { ...options, params: { custom_emoji_id: customEmojiId, duration }, postEvent },
    );
    if (!response.ok) {
      return response;
    }
    const { data } = response;
    return data.event === 'emoji_status_failed'
      ? err(new SetEmojiStatusError(data.payload.error))
      : ok(undefined);
  },
  () => isMethodSupported('web_app_set_emoji_status'),
);

/**
 * Asks the user to set the custom emoji as their status.
 *
 * Throwing version of `safeSetEmojiStatus`.
 * @param customEmojiId - custom emoji identifier.
 * @param options - additional options.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @throws {SetEmojiStatusError} The status was not set.
 * @throws {TimeoutError} The user didn't respond in time.
 * @since Mini Apps v8.0
 */
export const setEmojiStatus = /* @__PURE__ */ throwingWithIsSupported(safeSetEmojiStatus);
