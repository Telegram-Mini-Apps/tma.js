import { err, ok, type Result, type TimeoutError, unwrap } from '@tma.js/bridge';

import { DeviceStorageMethodError } from '../../errors.js';
import { isMethodSupported } from '../../globals.js';
import { safeRequestWithId } from '../../safeRequestWithId.js';
import type { AsyncOptions } from '../../types.js';

export type DeviceStorageError = DeviceStorageMethodError | TimeoutError;

/**
 * Persistent local storage on the user's device, similar to `localStorage`.
 *
 * All methods throw:
 * - `NotInitializedError` if the SDK is not initialized;
 * - `MethodUnsupportedError` if the storage is unsupported.
 *
 * Safe methods return `DeviceStorageMethodError` if the Telegram client failed to perform
 * the operation, or `TimeoutError` if it didn't respond in time.
 * @since Mini Apps v9.0
 */
export interface DeviceStorage {
  clear: (options?: AsyncOptions) => Promise<void>;
  deleteItem: (key: string, options?: AsyncOptions) => Promise<void>;
  getItem: (key: string, options?: AsyncOptions) => Promise<string | null>;
  /**
   * @returns True if the SDK is initialized and the storage is supported.
   */
  isSupported: () => boolean;
  /**
   * Removes all keys.
   */
  safeClear: (options?: AsyncOptions) => Promise<Result<DeviceStorageError, void>>;
  /**
   * Removes the key.
   */
  safeDeleteItem: (
    key: string,
    options?: AsyncOptions,
  ) => Promise<Result<DeviceStorageError, void>>;
  /**
   * @returns Value of the key, or `null` if it is missing.
   */
  safeGetItem: (
    key: string,
    options?: AsyncOptions,
  ) => Promise<Result<DeviceStorageError, string | null>>;
  /**
   * Saves the value. Passing `null` removes the key.
   */
  safeSetItem: (
    key: string,
    value: string | null,
    options?: AsyncOptions,
  ) => Promise<Result<DeviceStorageError, void>>;
  setItem: (key: string, value: string | null, options?: AsyncOptions) => Promise<void>;
}

const FAILED_EVENT = 'device_storage_failed';

/**
 * Persistent local storage on the user's device.
 * @since Mini Apps v9.0
 */
export const deviceStorage: DeviceStorage = {
  async clear(options) {
    return unwrap(await deviceStorage.safeClear(options));
  },
  async deleteItem(key, options) {
    return unwrap(await deviceStorage.safeDeleteItem(key, options));
  },
  async getItem(key, options) {
    return unwrap(await deviceStorage.safeGetItem(key, options));
  },
  isSupported: () => isMethodSupported('web_app_device_storage_get_key'),
  async safeClear(options) {
    const response = await safeRequestWithId(
      'web_app_device_storage_clear',
      'device_storage_cleared',
      FAILED_EVENT,
      {},
      options,
    );
    if (!response.ok) {
      return response;
    }
    return response.data.failed
      ? err(new DeviceStorageMethodError(response.data.error))
      : ok(undefined);
  },
  safeDeleteItem: (key, options) => deviceStorage.safeSetItem(key, null, options),
  async safeGetItem(key, options) {
    const response = await safeRequestWithId(
      'web_app_device_storage_get_key',
      'device_storage_key_received',
      FAILED_EVENT,
      { key },
      options,
    );
    if (!response.ok) {
      return response;
    }
    return response.data.failed
      ? err(new DeviceStorageMethodError(response.data.error))
      : ok(response.data.payload.value);
  },
  async safeSetItem(key, value, options) {
    const response = await safeRequestWithId(
      'web_app_device_storage_save_key',
      'device_storage_key_saved',
      FAILED_EVENT,
      { key, value },
      options,
    );
    if (!response.ok) {
      return response;
    }
    return response.data.failed
      ? err(new DeviceStorageMethodError(response.data.error))
      : ok(undefined);
  },
  async setItem(key, value, options) {
    return unwrap(await deviceStorage.safeSetItem(key, value, options));
  },
};
