import { err, ok, type Result, safeRequest, type TimeoutError } from '@tma.js/bridge';

import { AccessDeniedError } from '../../errors.js';
import { isMethodSupported, requireMethod } from '../../globals.js';
import { throwingWithIsSupported, withIsSupported } from '../../is-supported.js';
import type { AsyncOptions } from '../../types.js';

/**
 * Asks the user to download a file.
 * @param url - HTTPS URL of the file.
 * @param fileName - suggested file name.
 * @param options - additional options.
 * @returns `AccessDeniedError` if the user declined the download, or `TimeoutError` if the user
 * didn't respond in time.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @since Mini Apps v8.0
 */
export const safeDownloadFile = /* @__PURE__ */ withIsSupported(
  async function(
    url: string,
    fileName: string,
    options?: AsyncOptions,
  ): Promise<Result<AccessDeniedError | TimeoutError, void>> {
    const { postEvent } = requireMethod('web_app_request_file_download');
    const response = await safeRequest('web_app_request_file_download', 'file_download_requested', {
      ...options,
      params: { url, file_name: fileName },
      postEvent,
    });
    if (!response.ok) {
      return response;
    }
    return response.data.status === 'downloading'
      ? ok(undefined)
      : err(new AccessDeniedError('User declined the download'));
  },
  () => isMethodSupported('web_app_request_file_download'),
);

/**
 * Asks the user to download a file.
 *
 * Throwing version of `safeDownloadFile`.
 * @param url - HTTPS URL of the file.
 * @param fileName - suggested file name.
 * @param options - additional options.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @throws {AccessDeniedError} The user declined the download.
 * @throws {TimeoutError} The user didn't respond in time.
 * @since Mini Apps v8.0
 */
export const downloadFile = /* @__PURE__ */ throwingWithIsSupported(safeDownloadFile);
