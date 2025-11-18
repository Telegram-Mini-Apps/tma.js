import { EventPayload, type MethodParams, type Request2CaptureFn, RequestError } from '@tma.js/bridge';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import { SecureStorageMethodError } from '@/errors.js';
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

export type SecureStorageError = RequestError | SecureStorageMethodError;

export interface SecureStorageOptions extends SharedFeatureOptions,
  WithVersion,
  WithRequest,
  WithCreateRequestId {
}

/**
 * @since Mini Apps v9.0
 */
export class SecureStorage {
  constructor({ isTma, request, version, createRequestId }: SecureStorageOptions) {
    const wrapSupportedTask = createWithChecksFp({
      version,
      requires: 'web_app_secure_storage_get_key',
      isTma,
      returns: 'task',
    });

    const invokeMethod = <
      M extends (
        | 'web_app_secure_storage_save_key'
        | 'web_app_secure_storage_get_key'
        | 'web_app_secure_storage_restore_key'
        | 'web_app_secure_storage_save_key'
        | 'web_app_secure_storage_clear'
      ),
      E extends (
        | 'secure_storage_key_saved'
        | 'secure_storage_key_received'
        | 'secure_storage_key_restored'
        | 'secure_storage_cleared'
      ),
    >(
      method: M,
      event: E,
      params: Omit<MethodParams<M>, 'req_id'>,
    ): TE.TaskEither<SecureStorageError, EventPayload<E>> => {
      const requestId = createRequestId();
      return pipe(
        request<M, ('secure_storage_failed' | E)[]>(method, ['secure_storage_failed', event], {
          params: { ...params, req_id: requestId },
          capture: (event => {
            return 'payload' in event ? event.payload.req_id === requestId : true;
          }) as Request2CaptureFn<('secure_storage_failed' | E)[]>,
        }),
        TE.chain(response => (
          response.event === 'secure_storage_failed'
            ? TE.left(new SecureStorageMethodError(response.payload.error || 'UNKNOWN_ERROR'))
            : TE.right(response.payload as EventPayload<E>)
        )),
      );
    };

    this.getItemFp = wrapSupportedTask(key => {
      return pipe(
        invokeMethod('web_app_secure_storage_get_key', 'secure_storage_key_received', { key }),
        TE.map(payload => ({
          value: payload.value,
          canRestore: !!payload.can_restore,
        })),
      );
    });
    this.setItemFp = wrapSupportedTask((key, value) => {
      return pipe(
        invokeMethod('web_app_secure_storage_save_key', 'secure_storage_key_saved', { key, value }),
        TE.map(() => undefined),
      );
    });
    this.deleteItemFp = wrapSupportedTask(key => {
      return this.setItemFp(key, null);
    });
    this.clearFp = wrapSupportedTask(() => {
      return pipe(
        invokeMethod('web_app_secure_storage_clear', 'secure_storage_cleared', {}),
        TE.map(() => undefined),
      );
    });
    this.restoreItemFp = wrapSupportedTask(key => {
      return pipe(
        invokeMethod('web_app_secure_storage_restore_key', 'secure_storage_key_restored', { key }),
        TE.map(payload => payload.value),
      );
    });

    this.getItem = throwifyWithChecksFp(this.getItemFp);
    this.setItem = throwifyWithChecksFp(this.setItemFp);
    this.deleteItem = throwifyWithChecksFp(this.deleteItemFp);
    this.clear = throwifyWithChecksFp(this.clearFp);
    this.restoreItem = throwifyWithChecksFp(this.restoreItemFp);
  }

  /**
    * Retrieves an item using its key.
    * @since Mini Apps v9.0
    */
  readonly getItemFp: WithChecksFp<
    (key: string) => TE.TaskEither<SecureStorageError, {
      value: string | null;
      canRestore: boolean;
    }>,
    true
  >;

  /**
   * @see getItemFp
   */
  readonly getItem: WithChecks<
    (key: string) => Promise<{ value: string | null; canRestore: boolean }>,
    true
  >;

  /**
   * Restores an item from the storage.
   * @since Mini Apps v9.0
   */
  readonly restoreItemFp: WithChecksFp<
    (key: string) => TE.TaskEither<SecureStorageError, string | null>,
    true
  >;

  /**
   * @see restoreItemFp
   */
  readonly restoreItem: WithChecks<(key: string) => Promise<string | null>, true>;

  /**
    * Sets a new item in the storage.
    * @since Mini Apps v9.0
    */
  readonly setItemFp: WithChecksFp<
    (key: string, value: string | null) => TE.TaskEither<SecureStorageError, void>,
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
    (key: string) => TE.TaskEither<SecureStorageError, void>,
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
  readonly clearFp: WithChecksFp<() => TE.TaskEither<SecureStorageError, void>, true>;

  /**
   * @see clearFp
   */
  readonly clear: WithChecks<() => Promise<void>, true>;
}
