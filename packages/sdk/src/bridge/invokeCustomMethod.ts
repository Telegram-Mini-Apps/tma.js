import { captureSameReq } from './captureSameReq.js';
import type { CustomMethodName, CustomMethodParams } from './methods/custom-methods.js';
import { request } from './request.js';
import type { ExecuteWithOptions } from '../types/methods.js';

/**
 * Invokes known custom method. Returns method execution result.
 * @param method - method name.
 * @param params - method parameters.
 * @param requestId - request identifier.
 * @param options - additional options.
 */
export async function invokeCustomMethod<M extends CustomMethodName>(
  method: M,
  params: CustomMethodParams<M>,
  requestId: string,
  options?: ExecuteWithOptions,
): Promise<unknown>;

/**
 * Invokes unknown custom method. Returns method execution result.
 * @param method - method name.
 * @param params - method parameters.
 * @param requestId - request identifier.
 * @param options - additional options.
 */
export function invokeCustomMethod(
  method: string,
  params: object,
  requestId: string,
  options?: ExecuteWithOptions,
): Promise<unknown>;

export async function invokeCustomMethod(
  method: string,
  params: object,
  requestId: string,
  options: ExecuteWithOptions = {},
): Promise<unknown> {
  const {
    result,
    error,
  } = await request('web_app_invoke_custom_method', 'custom_method_invoked', {
    ...options,
    params: {
      method,
      params,
      req_id: requestId,
    },
    capture: captureSameReq(requestId),
  });

  if (error) {
    throw new Error(error);
  }

  return result;
}
