import { invokeCustomMethod } from '@/bridge/utils/invokeCustomMethod.js';
import { WithSupports } from '@/classes/WithSupports.js';
import { array } from '@/parsing/parsers/array.js';
import { json } from '@/parsing/parsers/json.js';
import { string } from '@/parsing/parsers/string.js';
import type { PostEvent } from '@/bridge/methods/postEvent.js';
import type { CreateRequestIdFn } from '@/request-id/types.js';
import type { ExecuteWithTimeout } from '@/types/methods.js';
import type { Version } from '@/version/types.js';

function objectFromKeys<K extends string, V>(keys: K[], value: V): Record<K, V> {
  return Object.fromEntries(keys.map((k) => [k, value])) as Record<K, V>;
}

// TODO: Usage.

/**
 * @see API: https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/components/cloud-storage
 */
export class CloudStorage extends WithSupports<'delete' | 'get' | 'getKeys' | 'set'> {
  constructor(
    version: Version,
    private readonly createRequestId: CreateRequestIdFn,
    private readonly postEvent: PostEvent,
  ) {
    super(version, {
      delete: 'web_app_invoke_custom_method',
      get: 'web_app_invoke_custom_method',
      getKeys: 'web_app_invoke_custom_method',
      set: 'web_app_invoke_custom_method',
    });
  }

  /**
   * Deletes specified key or keys from the cloud storage.
   * @param keyOrKeys - key or keys to delete.
   * @param options - request execution options.
   */
  async delete(keyOrKeys: string | string[], options: ExecuteWithTimeout = {}): Promise<void> {
    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    if (keys.length) {
      await invokeCustomMethod(
        'deleteStorageValues',
        { keys },
        this.createRequestId(),
        { ...options, postEvent: this.postEvent },
      );
    }
  }

  /**
   * Returns list of all keys presented in the cloud storage.
   * @param options - request execution options.
   */
  async getKeys(options: ExecuteWithTimeout = {}): Promise<string[]> {
    return array().of(string()).parse(
      await invokeCustomMethod(
        'getStorageKeys',
        {},
        this.createRequestId(),
        { ...options, postEvent: this.postEvent },
      ),
    );
  }

  /**
   * Returns map, where key is one of the specified in keys argument, and value is according
   * storage value.
   * @param keys - keys list.
   * @param options - request execution options.
   */
  get<K extends string>(keys: K[], options?: ExecuteWithTimeout): Promise<Record<K, string>>;

  /**
   * Returns value of the specified key.
   * @param key - cloud storage key.
   * @param options - request execution options.
   * @return Value of the specified key. In case, key was not created previously, function
   * will return empty string.
   */
  get(key: string, options?: ExecuteWithTimeout): Promise<string>;

  async get(
    keyOrKeys: string | string[],
    options: ExecuteWithTimeout = {},
  ): Promise<string | Record<string, string>> {
    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    if (!keys.length) {
      return objectFromKeys(keys, '');
    }

    const data = await invokeCustomMethod(
      'getStorageValues',
      { keys },
      this.createRequestId(),
      { ...options, postEvent: this.postEvent },
    );
    const result = json(objectFromKeys(keys, string()), 'CloudStorageData').parse(data);

    return Array.isArray(keyOrKeys) ? result : result[keyOrKeys];
  }

  /**
   * Saves specified value by key.
   * @param key - storage key.
   * @param value - storage value.
   * @param options - request execution options.
   */
  async set(key: string, value: string, options: ExecuteWithTimeout = {}): Promise<void> {
    await invokeCustomMethod(
      'saveStorageValue',
      { key, value },
      this.createRequestId(),
      { ...options, postEvent: this.postEvent },
    );
  }
}
