import {
  type RequestError,
  type CustomMethodName,
  type CustomMethodParams,
  type InvokeCustomMethodOptions,
  invokeCustomMethodFp,
} from '@tma.js/bridge';
import { taskEither as TE } from 'fp-ts';

import { createRequestId } from '@/globals/createRequestId.js';
import { postEventFp } from '@/globals/postEvent.js';

/**
 * Invokes known custom method. Returns method execution result.
 * @param method - method name.
 * @param params - method parameters.
 * @param options - additional options.
 */
export function invokeCustomMethod<M extends CustomMethodName>(
  method: M,
  params: CustomMethodParams<M>,
  options?: InvokeCustomMethodOptions,
): TE.TaskEither<RequestError, unknown>;

/**
 * Invokes unknown custom method. Returns method execution result.
 * @param method - method name.
 * @param params - method parameters.
 * @param options - additional options.
 */
export function invokeCustomMethod(
  method: string,
  params: object,
  options?: InvokeCustomMethodOptions,
): TE.TaskEither<RequestError, unknown>;

export function invokeCustomMethod(
  method: string,
  params: object,
  options?: InvokeCustomMethodOptions,
): TE.TaskEither<RequestError, unknown> {
  return invokeCustomMethodFp(method, params, createRequestId(), {
    ...options || {},
    postEvent: postEventFp,
  });
}
