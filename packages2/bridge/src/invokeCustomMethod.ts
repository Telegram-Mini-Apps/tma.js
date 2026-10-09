import { InvokeCustomMethodFailedError, type TimeoutError } from './errors.js';
import { captureSameReq, createRequestId, type RequestOptions, safeRequest } from './request.js';
import { err, ok, type Result, unwrap } from './result.js';
import type { CustomMethodName, CustomMethodParams } from './types/index.js';

export interface InvokeCustomMethodOptions
  extends Omit<RequestOptions<'custom_method_invoked'>, 'capture'> {
  /**
   * Request identifier. Generated automatically if omitted.
   */
  requestId?: string;
}

/**
 * Invokes a custom method and returns its result.
 * @param method - method name.
 * @param params - method parameters.
 * @param options - additional options.
 * @returns Method result, or one of the errors:
 * - `InvokeCustomMethodFailedError`: the method returned an error;
 * - `TimeoutError`: the timeout was reached.
 */
export function safeInvokeCustomMethod<M extends CustomMethodName>(
  method: M,
  params: CustomMethodParams<M>,
  options?: InvokeCustomMethodOptions,
): Promise<Result<unknown, InvokeCustomMethodFailedError | TimeoutError>>;
export function safeInvokeCustomMethod(
  method: string,
  params: object,
  options?: InvokeCustomMethodOptions,
): Promise<Result<unknown, InvokeCustomMethodFailedError | TimeoutError>>;
export async function safeInvokeCustomMethod(
  method: string,
  params: object,
  { requestId = createRequestId(), ...options }: InvokeCustomMethodOptions = {},
): Promise<Result<unknown, InvokeCustomMethodFailedError | TimeoutError>> {
  const response = await safeRequest(
    'web_app_invoke_custom_method',
    'custom_method_invoked',
    {
      ...options,
      params: { method, params, req_id: requestId },
      capture: captureSameReq(requestId),
    },
  );
  if (!response.ok) {
    return response;
  }
  const { result, error } = response.data;
  return error ? err(new InvokeCustomMethodFailedError(error)) : ok(result);
}

/**
 * Invokes a custom method and returns its result.
 *
 * Throwing version of `safeInvokeCustomMethod`.
 * @param method - method name.
 * @param params - method parameters.
 * @param options - additional options.
 * @throws {InvokeCustomMethodFailedError} The method returned an error.
 * @throws {TimeoutError} The timeout was reached.
 */
export function invokeCustomMethod<M extends CustomMethodName>(
  method: M,
  params: CustomMethodParams<M>,
  options?: InvokeCustomMethodOptions,
): Promise<unknown>;
export function invokeCustomMethod(
  method: string,
  params: object,
  options?: InvokeCustomMethodOptions,
): Promise<unknown>;
export async function invokeCustomMethod(
  method: string,
  params: object,
  options?: InvokeCustomMethodOptions,
): Promise<unknown> {
  return unwrap(await safeInvokeCustomMethod(method, params, options));
}
