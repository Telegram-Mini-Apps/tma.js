import { BetterPromise } from 'better-promises';
import { taskEither as TE, function as fn } from 'fp-ts';

import { InvokeCustomMethodFailedError } from '@/errors.js';
import { captureSameReq } from '@/methods/captureSameReq.js';
import type { CustomMethodName, CustomMethodParams } from '@/methods/types/index.js';

import {
  request2Fp,
  type Request2Error,
  type Request2FpOptions,
  type Request2Options,
} from './request2.js';

export type InvokeCustomMethodError = Request2Error | InvokeCustomMethodFailedError;

export type InvokeCustomMethodOptions = Omit<Request2Options<'custom_method_invoked'>, 'capture'>;
export type InvokeCustomMethodFn = typeof invokeCustomMethod;

export type InvokeCustomMethodFpOptions = Omit<Request2FpOptions<'custom_method_invoked'>, 'capture'>;
export type InvokeCustomMethodFpFn = typeof invokeCustomMethodFp;

/**
 * Invokes known custom method. Returns method execution result.
 * @param method - method name.
 * @param params - method parameters.
 * @param requestId - request identifier.
 * @param options - additional options.
 */
export function invokeCustomMethodFp<M extends CustomMethodName>(
  method: M,
  params: CustomMethodParams<M>,
  requestId: string,
  options?: InvokeCustomMethodFpOptions,
): TE.TaskEither<InvokeCustomMethodError, unknown>;

/**
 * Invokes unknown custom method. Returns method execution result.
 * @param method - method name.
 * @param params - method parameters.
 * @param requestId - request identifier.
 * @param options - additional options.
 */
export function invokeCustomMethodFp(
  method: string,
  params: object,
  requestId: string,
  options?: InvokeCustomMethodFpOptions,
): TE.TaskEither<Request2Error, unknown>;

export function invokeCustomMethodFp(
  method: string,
  params: object,
  requestId: string,
  options?: InvokeCustomMethodFpOptions,
): TE.TaskEither<InvokeCustomMethodError, unknown> {
  return fn.pipe(
    request2Fp('web_app_invoke_custom_method', 'custom_method_invoked', {
      ...options || {},
      params: { method, params, req_id: requestId },
      capture: captureSameReq(requestId),
    }),
    TE.chain(({ result, error }) => {
      return error
        ? TE.left(new InvokeCustomMethodFailedError(error))
        : TE.right(result);
    }),
  );
}

/**
 * @see invokeCustomMethodFp
 */
export function invokeCustomMethod<M extends CustomMethodName>(
  method: M,
  params: CustomMethodParams<M>,
  requestId: string,
  options?: InvokeCustomMethodOptions,
): BetterPromise<unknown>;

/**
 * @see invokeCustomMethodFp
 */
export function invokeCustomMethod(
  method: string,
  params: object,
  requestId: string,
  options?: InvokeCustomMethodOptions,
): BetterPromise<unknown>;

export function invokeCustomMethod(
  method: string,
  params: object,
  requestId: string,
  options?: InvokeCustomMethodOptions,
): BetterPromise<unknown> {
  return BetterPromise.fn(() => {
    return fn.pipe(
      // @ts-expect-error TypeScript is unable to determine required override.
      invokeCustomMethodFp(method, params, requestId, options),
      TE.match(
        error => {
          throw error;
        },
        result => result,
      ),
    )();
  });
}
