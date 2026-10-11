import type { InvokeCustomMethodFpOptions, RequestError } from '@tma.js/bridge';
import type { Computed } from '@tma.js/signals';
import { BetterPromise } from 'better-promises';
import { taskEither as TE, function as fn } from 'fp-ts';
import { array, parse, record, string } from 'valibot';

import type { SharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import type { WithInvokeCustomMethod } from '@/fn-options/withInvokeCustomMethod.js';
import type { WithVersion } from '@/fn-options/withVersion.js';
import { createIsSupportedSignal } from '@/helpers/createIsSupportedSignal.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import { createWithChecksFp, type WithChecks, type WithChecksFp } from '@/with-checks/withChecksFp.js';

type CloudStorageTask<T> = TE.TaskEither<RequestError, T>;

export interface CloudStorageOptions extends WithVersion,
  WithInvokeCustomMethod,
  SharedFeatureOptions {
}

/**
 * @since Mini Apps v6.9
 */
export class CloudStorage {
  constructor({ version, isTma, invokeCustomMethod }: CloudStorageOptions) {
    const wrapSupportedTask = createWithChecksFp({
      version,
      requires: 'web_app_invoke_custom_method',
      isTma,
      returns: 'task',
    });

    this.isSupported = createIsSupportedSignal('web_app_invoke_custom_method', version);
    this.deleteItemFp = wrapSupportedTask((keyOrKeys, options) => {
      const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
      return fn.pipe(
        keys.length
          ? invokeCustomMethod('deleteStorageValues', { keys }, options)
          : TE.right(undefined),
        TE.map(() => undefined),
      );
    });
    this.getItemFp = wrapSupportedTask((key, options) => {
      return fn.pipe(
        this.getItemsFp([key], options),
        TE.map(values => values[key] || ''),
      );
    });
    this.getItemsFp = wrapSupportedTask((keys, options) => {
      return fn.pipe(
        keys.length ? invokeCustomMethod('getStorageValues', { keys }, options) : TE.right({}),
        TE.map(data => {
          return {
            // Fulfill the response with probably missing keys.
            ...keys.reduce<Record<string, string>>((acc, key) => {
              acc[key] = '';
              return acc;
            }, {}),
            ...parse(record(string(), string()), data),
          };
        }),
      );
    });
    this.getKeysFp = wrapSupportedTask(options => {
      return fn.pipe(
        invokeCustomMethod('getStorageKeys', {}, options),
        TE.map(data => parse(array(string()), data)),
      );
    });
    this.setItemFp = wrapSupportedTask((key, value, options) => {
      return fn.pipe(
        invokeCustomMethod('saveStorageValue', { key, value }, options),
        TE.map(() => undefined),
      );
    });
    this.clearFp = wrapSupportedTask(options => {
      return fn.pipe(this.getKeysFp(options), TE.chain(this.deleteItemFp));
    });

    this.deleteItem = throwifyWithChecksFp(this.deleteItemFp);
    this.getItem = throwifyWithChecksFp(this.getItemFp);
    this.getItems = throwifyWithChecksFp(this.getItemsFp);
    this.getKeys = throwifyWithChecksFp(this.getKeysFp);
    this.setItem = throwifyWithChecksFp(this.setItemFp);
    this.clear = throwifyWithChecksFp(this.clearFp);
  }

  /**
   * Signal indicating if the component is supported.
   */
  readonly isSupported: Computed<boolean>;

  /**
   * Deletes specified key or keys from the cloud storage.
   * @param keyOrKeys - key or keys to delete.
   * @param options - request execution options.
   * @since Mini Apps v6.9
   */
  readonly deleteItemFp: WithChecksFp<
    (keyOrKeys: string | string[], options?: InvokeCustomMethodFpOptions) => CloudStorageTask<void>,
    true
  >;

  readonly deleteItem: WithChecks<
    (keyOrKeys: string | string[], options?: InvokeCustomMethodFpOptions) => BetterPromise<void>,
    true
  >;

  /**
   * Gets a single key value from the cloud storage.
   * @param key - a key to get.
   * @param options - request execution options.
   * @returns A key value as a string.
   * @since Mini Apps v6.9
   */
  readonly getItemFp: WithChecksFp<
    (key: string, options?: InvokeCustomMethodFpOptions) => CloudStorageTask<string>,
    true
  >;

  /**
   * @see getItemFp
   */
  readonly getItem: WithChecks<{
    <K extends string>(
      keys: K[],
      options?: InvokeCustomMethodFpOptions,
    ): BetterPromise<Record<K, string>>;
    (key: string, options?: InvokeCustomMethodFpOptions): BetterPromise<string>;
  }, true>;

  /**
   * Gets multiple keys' values from the cloud storage.
   * @param keys - keys list.
   * @param options - request execution options.
   * @returns A map, where a key is one of the specified in the `keys` argument,
   * and a value is a corresponding storage value if an array of keys was passed.
   * @since Mini Apps v6.9
   */
  readonly getItemsFp: WithChecksFp<
    <K extends string>(
      keys: K[],
      options?: InvokeCustomMethodFpOptions,
    ) => CloudStorageTask<Record<K, string>>,
    true
  >;

  /**
   * @see getItemsFp
   */
  readonly getItems: WithChecks<
    <K extends string>(
      keys: K[],
      options?: InvokeCustomMethodFpOptions,
    ) => BetterPromise<Record<K, string>>,
    true
  >;

  /**
   * Returns a list of all keys presented in the cloud storage.
   * @param options - request execution options.
   * @since Mini Apps v6.9
   */
  readonly getKeysFp: WithChecksFp<
    (options?: InvokeCustomMethodFpOptions) => CloudStorageTask<string[]>,
    true
  >;

  /**
   * @see getKeysFp
   */
  readonly getKeys: WithChecks<
    (options?: InvokeCustomMethodFpOptions) => BetterPromise<string[]>,
    true
  >;

  /**
   * Saves the specified value by a key.
   * @param key - storage key.
   * @param value - storage value.
   * @param options - request execution options.
   * @since Mini Apps v6.9
   */
  readonly setItemFp: WithChecksFp<
    (key: string, value: string, options?: InvokeCustomMethodFpOptions) => CloudStorageTask<void>,
    true
  >;

  /**
   * @see setItemFp
   */
  readonly setItem: WithChecks<
    (key: string, value: string, options?: InvokeCustomMethodFpOptions) => BetterPromise<void>,
    true
  >;

  /**
   * Clears the cloud storage.
   * @param options - additional options.
   * @since Mini Apps v6.9
   */
  readonly clearFp: WithChecksFp<
    (options?: InvokeCustomMethodFpOptions) => CloudStorageTask<void>,
    true
  >;

  /**
   * @see clearFp
   */
  readonly clear: WithChecks<(options?: InvokeCustomMethodFpOptions) => BetterPromise<void>, true>;
}
