import {
  err,
  type InvokeCustomMethodFailedError,
  ok,
  type Result,
  safeInvokeCustomMethod,
  type TimeoutError,
  unwrap,
} from '@tma.js/bridge';
import {
  array,
  type GenericSchema,
  record,
  safeParse,
  string,
  unknown,
  ValiError,
} from 'valibot';

import { InvalidResponseError } from '../../errors.js';
import { isMethodSupported, requireMethod } from '../../globals.js';
import type { AsyncOptions } from '../../types.js';

export type CloudStorageError =
  | InvalidResponseError
  | InvokeCustomMethodFailedError
  | TimeoutError;

/**
 * Cloud storage of the bot. Each user has their own storage of up to 1024 keys.
 *
 * All methods throw:
 * - `NotInitializedError` if the SDK is not initialized;
 * - `MethodUnsupportedError` if the storage is unsupported.
 *
 * Safe methods return `InvokeCustomMethodFailedError` if the Telegram client failed to perform
 * the operation, `TimeoutError` if it didn't respond in time, or `InvalidResponseError` if it
 * responded with an unexpected value.
 * @since Mini Apps v6.9
 */
export interface CloudStorage {
  /**
   * @returns True if the SDK is initialized and the storage is supported.
   */
  isSupported: () => boolean;
  /**
   * @returns Value of the key, or an empty string if it is missing.
   */
  safeGetItem: (key: string, options?: AsyncOptions) => Promise<Result<CloudStorageError, string>>;
  getItem: (key: string, options?: AsyncOptions) => Promise<string>;
  /**
   * @returns Values of the keys. Missing keys have empty strings.
   */
  safeGetItems: <K extends string>(
    keys: K[],
    options?: AsyncOptions,
  ) => Promise<Result<CloudStorageError, Record<K, string>>>;
  getItems: <K extends string>(keys: K[], options?: AsyncOptions) => Promise<Record<K, string>>;
  /**
   * @returns All keys of the storage.
   */
  safeGetKeys: (options?: AsyncOptions) => Promise<Result<CloudStorageError, string[]>>;
  getKeys: (options?: AsyncOptions) => Promise<string[]>;
  /**
   * Saves the value.
   * @param key - key, 1-128 characters. Only `A-Z`, `a-z`, `0-9`, `_` and `-` are allowed.
   * @param value - value, 0-4096 characters.
   */
  safeSetItem: (
    key: string,
    value: string,
    options?: AsyncOptions,
  ) => Promise<Result<CloudStorageError, void>>;
  setItem: (key: string, value: string, options?: AsyncOptions) => Promise<void>;
  /**
   * Removes the key or keys.
   */
  safeDeleteItem: (
    keyOrKeys: string | string[],
    options?: AsyncOptions,
  ) => Promise<Result<CloudStorageError, void>>;
  deleteItem: (keyOrKeys: string | string[], options?: AsyncOptions) => Promise<void>;
  /**
   * Removes all keys.
   */
  safeClear: (options?: AsyncOptions) => Promise<Result<CloudStorageError, void>>;
  clear: (options?: AsyncOptions) => Promise<void>;
}

const METHOD = 'web_app_invoke_custom_method';

async function invoke<T>(
  method: 'deleteStorageValues' | 'getStorageKeys' | 'getStorageValues' | 'saveStorageValue',
  params: object,
  schema: GenericSchema<unknown, T>,
  options?: AsyncOptions,
): Promise<Result<CloudStorageError, T>> {
  const { postEvent } = requireMethod(METHOD);
  const response = await safeInvokeCustomMethod(method, params, { ...options, postEvent });
  if (!response.ok) {
    return response;
  }
  const parsed = safeParse(schema, response.data);
  return parsed.success
    ? ok(parsed.output)
    : err(new InvalidResponseError(response.data, new ValiError(parsed.issues)));
}

/**
 * Cloud storage of the bot.
 * @since Mini Apps v6.9
 */
export const cloudStorage: CloudStorage = {
  isSupported: () => isMethodSupported(METHOD),
  async safeGetItem(key, options) {
    const result = await cloudStorage.safeGetItems([key], options);
    return result.ok ? ok(result.data[key]) : result;
  },
  async getItem(key, options) {
    return unwrap(await cloudStorage.safeGetItem(key, options));
  },
  async safeGetItems(keys, options) {
    if (!keys.length) {
      requireMethod(METHOD);
      return ok({} as Record<(typeof keys)[number], string>);
    }
    const result = await invoke(
      'getStorageValues',
      { keys },
      record(string(), string()),
      options,
    );
    return result.ok
      // Missing keys are not returned.
      ? ok(Object.fromEntries(keys.map(key => [key, result.data[key] || ''])) as Record<
        (typeof keys)[number],
        string
      >)
      : result;
  },
  async getItems(keys, options) {
    return unwrap(await cloudStorage.safeGetItems(keys, options));
  },
  safeGetKeys: options => invoke('getStorageKeys', {}, array(string()), options),
  async getKeys(options) {
    return unwrap(await cloudStorage.safeGetKeys(options));
  },
  async safeSetItem(key, value, options) {
    const result = await invoke('saveStorageValue', { key, value }, unknown(), options);
    return result.ok ? ok(undefined) : result;
  },
  async setItem(key, value, options) {
    return unwrap(await cloudStorage.safeSetItem(key, value, options));
  },
  async safeDeleteItem(keyOrKeys, options) {
    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    if (!keys.length) {
      requireMethod(METHOD);
      return ok(undefined);
    }
    const result = await invoke('deleteStorageValues', { keys }, unknown(), options);
    return result.ok ? ok(undefined) : result;
  },
  async deleteItem(keyOrKeys, options) {
    return unwrap(await cloudStorage.safeDeleteItem(keyOrKeys, options));
  },
  async safeClear(options) {
    const keys = await cloudStorage.safeGetKeys(options);
    return keys.ok ? cloudStorage.safeDeleteItem(keys.data, options) : keys;
  },
  async clear(options) {
    return unwrap(await cloudStorage.safeClear(options));
  },
};
