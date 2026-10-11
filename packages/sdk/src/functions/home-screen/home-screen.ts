import {
  type HomeScreenStatus,
  ok,
  type Result,
  safeRequest,
  type TimeoutError,
} from '@tma.js/bridge';

import { isMethodSupported, requireMethod } from '../../globals.js';
import { throwingWithIsSupported, withIsSupported } from '../../is-supported.js';
import type { AsyncOptions } from '../../types.js';

/**
 * Asks the user to add the mini app to the home screen.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @since Mini Apps v8.0
 */
export const addToHomeScreen = /* @__PURE__ */ withIsSupported(
  function(): void {
    requireMethod('web_app_add_to_home_screen').postEvent('web_app_add_to_home_screen');
  },
  () => isMethodSupported('web_app_add_to_home_screen'),
);

/**
 * Checks if the mini app is added to the home screen.
 * @param options - additional options.
 * @returns Home screen status, or `TimeoutError` if the Telegram client didn't respond in time.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @since Mini Apps v8.0
 */
export const safeCheckHomeScreenStatus = /* @__PURE__ */ withIsSupported(
  async function(
    options?: AsyncOptions,
  ): Promise<Result<TimeoutError, HomeScreenStatus>> {
    const { postEvent } = requireMethod('web_app_check_home_screen');
    const response = await safeRequest('web_app_check_home_screen', 'home_screen_checked', {
      ...options,
      postEvent,
    });
    return response.ok ? ok(response.data.status || 'unknown') : response;
  },
  () => isMethodSupported('web_app_check_home_screen'),
);

/**
 * Checks if the mini app is added to the home screen.
 *
 * Throwing version of `safeCheckHomeScreenStatus`.
 * @param options - additional options.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @throws {TimeoutError} The Telegram client didn't respond in time.
 * @since Mini Apps v8.0
 */
export const checkHomeScreenStatus = /* @__PURE__ */ throwingWithIsSupported(
  safeCheckHomeScreenStatus,
);
