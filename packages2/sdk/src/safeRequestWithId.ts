import {
  createRequestId,
  type EventName,
  type EventPayload,
  type MethodName,
  ok,
  type Result,
  safeRequest,
  type TimeoutError,
} from '@tma.js/bridge';

import { requireMethod } from './globals.js';
import type { AsyncOptions } from './types.js';

type LooseRequest = (
  method: MethodName,
  events: EventName[],
  options: object,
) => Promise<Result<TimeoutError, { event: EventName; payload: any }>>;

/**
 * Calls a method requiring the `req_id` parameter and waits for one of the events with the same
 * request identifier.
 * @param method - method name.
 * @param event - event emitted on success.
 * @param failedEvent - event emitted on failure.
 * @param params - method parameters except `req_id`.
 * @param options - additional options.
 * @returns Success event payload, or the error from the failure event payload.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @internal
 */
export async function safeRequestWithId<E extends EventName>(
  method: MethodName,
  event: E,
  failedEvent: 'device_storage_failed' | 'secure_storage_failed',
  params: object,
  options?: AsyncOptions,
): Promise<Result<
  TimeoutError,
  { failed: false; payload: EventPayload<E> } | { failed: true; error: string }
>> {
  const { postEvent } = requireMethod(method);
  const reqId = createRequestId();
  const response = await (safeRequest as LooseRequest)(method, [failedEvent, event], {
    ...options,
    params: { ...params, req_id: reqId },
    capture: (value: { payload: { req_id: string } }) => value.payload.req_id === reqId,
    postEvent,
  });
  if (!response.ok) {
    return response;
  }
  const { event: received, payload } = response.data;
  return ok(received === failedEvent
    ? { failed: true, error: (payload as { error?: string }).error || 'UNKNOWN_ERROR' }
    : { failed: false, payload });
}
