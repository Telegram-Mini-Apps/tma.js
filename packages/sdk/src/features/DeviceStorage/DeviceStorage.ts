import { EventPayload, type MethodParams, type Request2CaptureFn, RequestError } from '@tma.js/bridge';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import { DeviceStorageMethodError } from '@/errors.js';
import type { SharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import type { WithCreateRequestId } from '@/fn-options/withCreateRequestId.js';
import type { WithRequest } from '@/fn-options/withRequest.js';
import type { WithVersion } from '@/fn-options/withVersion.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import {
  createWithChecksFp,
  type WithChecks,
  type WithChecksFp,
} from '@/with-checks/withChecksFp.js';

export type DeviceStorageError = RequestError | DeviceStorageMethodError;

export interface DeviceStorageOptions extends SharedFeatureOptions,
  WithVersion,
  WithRequest,
  WithCreateRequestId {
}

/**
 * @since Mini Apps v9.0
 */
export class DeviceStorage {
  constructor({ isTma, request, version, createRequestId }: DeviceStorageOptions) {
    const wrapSupportedTask = createWithChecksFp({
      version,
      requires: 'web_app_device_storage_get_key',
      isTma,
      returns: 'task',
    });

    const invokeMethod = <
      M extends (
        | 'web_app_device_storage_save_key'
        | 'web_app_device_storage_get_key'
        | 'web_app_device_storage_save_key'
        | 'web_app_device_storage_clear'
      ),
      E extends (
        | 'device_storage_key_saved'
        | 'device_storage_key_received'
        | 'device_storage_cleared'
      ),
    >(
      method: M,
      event: E,
      params: Omit<MethodParams<M>, 'req_id'>,
    ): TE.TaskEither<DeviceStorageError, EventPayload<E>> => {
      const requestId = createRequestId();
      return pipe(
        request<M, ('device_storage_failed' | E)[]>(method, ['device_storage_failed', event], {
          params: { ...params, req_id: requestId },
          capture: (event => {
            return 'payload' in event ? event.payload.req_id === requestId : true;
          }) as Request2CaptureFn<('device_storage_failed' | E)[]>,
        }),
        TE.chain(response => (
          response.event === 'device_storage_failed'
            ? TE.left(new DeviceStorageMethodError(response.payload.error || 'UNKNOWN_ERROR'))
            : TE.right(response.payload as EventPayload<E>)
        )),
      );
    };

    this.getItemFp = wrapSupportedTask(key => {
      return pipe(
        invokeMethod('web_app_device_storage_get_key', 'device_storage_key_received', { key }),
        TE.map(payload => payload.value),
      );
    });
    this.setItemFp = wrapSupportedTask((key, value) => {
      return pipe(
        invokeMethod('web_app_device_storage_save_key', 'device_storage_key_saved', { key, value }),
        TE.map(() => undefined),
      );
    });
    this.deleteItemFp = wrapSupportedTask(key => {
      return this.setItemFp(key, null);
    });
    this.clearFp = wrapSupportedTask(() => {
      return pipe(
        invokeMethod('web_app_device_storage_clear', 'device_storage_cleared', {}),
        TE.map(() => undefined),
      );
    });

    this.getItem = throwifyWithChecksFp(this.getItemFp);
    this.setItem = throwifyWithChecksFp(this.setItemFp);
    this.deleteItem = throwifyWithChecksFp(this.deleteItemFp);
    this.clear = throwifyWithChecksFp(this.clearFp);
  }

  /**
    * Retrieves an item using its key.
    * @since Mini Apps v9.0
    */
  readonly getItemFp: WithChecksFp<
    (key: string) => TE.TaskEither<DeviceStorageError, string | null>,
    true
  >;

  /**
   * @see getItemFp
   */
  readonly getItem: WithChecks<(key: string) => Promise<string | null>, true>;

  /**
    * Sets a new item in the storage.
    * @since Mini Apps v9.0
    */
  readonly setItemFp: WithChecksFp<
    (key: string, value: string | null) => TE.TaskEither<DeviceStorageError, void>,
    true
  >;

  /**
   * @see setItemFp
   */
  readonly setItem: WithChecks<(key: string, value: string | null) => Promise<void>, true>;

  /**
    * Removes a key from the storage.
    * @since Mini Apps v9.0
    */
  readonly deleteItemFp: WithChecksFp<
    (key: string) => TE.TaskEither<DeviceStorageError, void>,
    true
  >;

  /**
   * @see deleteItemFp
   */
  readonly deleteItem: WithChecks<(key: string) => Promise<void>, true>;

  /**
    * Removes all keys from the storage.
    * @since Mini Apps v9.0
    */
  readonly clearFp: WithChecksFp<() => TE.TaskEither<DeviceStorageError, void>, true>;

  /**
   * @see clearFp
   */
  readonly clear: WithChecks<() => Promise<void>, true>;
}
