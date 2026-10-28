import { err, ok, type Result, type TimeoutError, unwrap } from '@tma.js/bridge';

import { SecureStorageMethodError } from '../../errors.js';
import { isMethodSupported } from '../../globals.js';
import { safeRequestWithId } from '../../safeRequestWithId.js';
import type { AsyncOptions } from '../../types.js';

export type SecureStorageError = SecureStorageMethodError | TimeoutError;

export interface SecureStorageItem {
  /**
   * True if the value is missing, but can be restored from the iCloud backup with
   * `restoreItem`. Available on iOS only.
   */
  canRestore: boolean;
  /**
   * Value of the key, or `null` if it is missing.
   */
  value: string | null;
}

/**
 * Secure storage for sensitive data, like tokens. It uses the iOS Keychain and the Android
 * Keystore.
 *
 * All methods throw:
 * - `NotInitializedError` if the SDK is not initialized;
 * - `MethodUnsupportedError` if the storage is unsupported.
 *
 * Safe methods return `SecureStorageMethodError` if the Telegram client failed to perform
 * the operation, or `TimeoutError` if it didn't respond in time.
 * @since Mini Apps v9.0
 */
export interface SecureStorage {
  clear: (options?: AsyncOptions) => Promise<void>;
  deleteItem: (key: string, options?: AsyncOptions) => Promise<void>;
  getItem: (key: string, options?: AsyncOptions) => Promise<SecureStorageItem>;
  /**
   * @returns True if the SDK is initialized and the storage is supported.
   */
  isSupported: () => boolean;
  restoreItem: (key: string, options?: AsyncOptions) => Promise<string | null>;
  /**
   * Removes all keys.
   */
  safeClear: (options?: AsyncOptions) => Promise<Result<SecureStorageError, void>>;
  /**
   * Removes the key.
   */
  safeDeleteItem: (
    key: string,
    options?: AsyncOptions,
  ) => Promise<Result<SecureStorageError, void>>;
  safeGetItem: (
    key: string,
    options?: AsyncOptions,
  ) => Promise<Result<SecureStorageError, SecureStorageItem>>;
  /**
   * Restores the value from the iCloud backup. The user is asked to confirm it.
   * @returns Restored value, or `null` if it is missing.
   */
  safeRestoreItem: (
    key: string,
    options?: AsyncOptions,
  ) => Promise<Result<SecureStorageError, string | null>>;
  /**
   * Saves the value. Passing `null` removes the key.
   */
  safeSetItem: (
    key: string,
    value: string | null,
    options?: AsyncOptions,
  ) => Promise<Result<SecureStorageError, void>>;
  setItem: (key: string, value: string | null, options?: AsyncOptions) => Promise<void>;
}

const FAILED_EVENT = 'secure_storage_failed';

/**
 * Secure storage for sensitive data.
 * @since Mini Apps v9.0
 */
export const secureStorage: SecureStorage = {
  async clear(options) {
    return unwrap(await secureStorage.safeClear(options));
  },
  async deleteItem(key, options) {
    return unwrap(await secureStorage.safeDeleteItem(key, options));
  },
  async getItem(key, options) {
    return unwrap(await secureStorage.safeGetItem(key, options));
  },
  isSupported: () => isMethodSupported('web_app_secure_storage_get_key'),
  async restoreItem(key, options) {
    return unwrap(await secureStorage.safeRestoreItem(key, options));
  },
  async safeClear(options) {
    const response = await safeRequestWithId(
      'web_app_secure_storage_clear',
      'secure_storage_cleared',
      FAILED_EVENT,
      {},
      options,
    );
    if (!response.ok) {
      return response;
    }
    return response.data.failed
      ? err(new SecureStorageMethodError(response.data.error))
      : ok(undefined);
  },
  safeDeleteItem: (key, options) => secureStorage.safeSetItem(key, null, options),
  async safeGetItem(key, options) {
    const response = await safeRequestWithId(
      'web_app_secure_storage_get_key',
      'secure_storage_key_received',
      FAILED_EVENT,
      { key },
      options,
    );
    if (!response.ok) {
      return response;
    }
    if (response.data.failed) {
      return err(new SecureStorageMethodError(response.data.error));
    }
    const { can_restore, value } = response.data.payload;
    return ok({ canRestore: !!can_restore, value });
  },
  async safeRestoreItem(key, options) {
    const response = await safeRequestWithId(
      'web_app_secure_storage_restore_key',
      'secure_storage_key_restored',
      FAILED_EVENT,
      { key },
      options,
    );
    if (!response.ok) {
      return response;
    }
    return response.data.failed
      ? err(new SecureStorageMethodError(response.data.error))
      : ok(response.data.payload.value);
  },
  async safeSetItem(key, value, options) {
    const response = await safeRequestWithId(
      'web_app_secure_storage_save_key',
      'secure_storage_key_saved',
      FAILED_EVENT,
      { key, value },
      options,
    );
    if (!response.ok) {
      return response;
    }
    return response.data.failed
      ? err(new SecureStorageMethodError(response.data.error))
      : ok(undefined);
  },
  async setItem(key, value, options) {
    return unwrap(await secureStorage.safeSetItem(key, value, options));
  },
};
