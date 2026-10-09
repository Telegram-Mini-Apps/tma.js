import { TimeoutError } from './errors.js';
import { onEvent } from './events.js';
import { postEvent as defaultPostEvent, type PostEventFn } from './postEvent.js';
import { err, ok, type Result, unwrap } from './result.js';
import type {
  EventListenerPayload,
  EventName,
  MethodName,
  MethodNameWithRequiredParams,
  MethodParams,
} from './types/index.js';

type AnyEventName = EventName | EventName[];

/**
 * Value captured by the `request` function. For a list of tracked events, it also contains
 * the event name.
 */
export type RequestResult<E extends AnyEventName> = E extends (infer U extends EventName)[]
  ? { [K in U]: { event: K; payload: EventListenerPayload<K> } }[U]
  : E extends EventName ? EventListenerPayload<E> : never;

export interface RequestOptions<E extends AnyEventName> {
  /**
   * Function returning true if the received event should be captured. If omitted, the first
   * tracked event is captured.
   */
  capture?: (value: RequestResult<E>) => boolean;
  /**
   * Time in milliseconds to wait for the event. When reached, the request fails with
   * `TimeoutError`.
   */
  timeout?: number;
  /**
   * Signal to abort the request. When aborted, the request is rejected with `signal.reason`.
   */
  signal?: AbortSignal;
  /**
   * Custom function to call the method.
   */
  postEvent?: PostEventFn;
}

/**
 * Options of the `request` function. The `params` option is required only if the method
 * requires parameters.
 */
export type RequestFnOptions<M extends MethodName, E extends AnyEventName> =
  RequestOptions<E> & ([MethodParams<M>] extends [never]
    ? { params?: never }
    : M extends MethodNameWithRequiredParams
      ? { params: MethodParams<M> }
      : { params?: MethodParams<M> });

export type RequestFnArgs<M extends MethodName, E extends AnyEventName> =
  M extends MethodNameWithRequiredParams
    ? [options: RequestFnOptions<M, E>]
    : [options?: RequestFnOptions<M, E>];

/**
 * Calls a Mini Apps method and waits for the specified event (or one of the events) to occur.
 *
 * Listeners are added before the method is called, so events emitted synchronously are
 * captured too.
 *
 * The request is rejected with `signal.reason` if it was aborted, and with the error thrown by
 * `postEvent` or the `capture` option.
 * @param method - method name.
 * @param events - event or events to wait for.
 * @param args - additional options.
 * @returns For a single event, its payload. For a list of events, an object with the captured
 * event name and payload. If the timeout was reached, `TimeoutError`.
 * @example
 * const result = await safeRequest('web_app_request_phone', 'phone_requested', { timeout: 5000 });
 * if (!result.ok) {
 *   console.log('The user didn\'t respond in time');
 * }
 */
export function safeRequest<M extends MethodName, E extends AnyEventName>(
  method: M,
  events: E,
  ...args: RequestFnArgs<M, E>
): Promise<Result<RequestResult<E>, TimeoutError>> {
  const {
    capture = () => true,
    timeout,
    signal,
    params,
    postEvent = defaultPostEvent,
  } = (args[0] || {}) as RequestOptions<E> & { params?: unknown };

  return new Promise<Result<RequestResult<E>, TimeoutError>>((resolve, reject) => {
    if (signal && signal.aborted) {
      // Rejecting with the abort reason is the standard behavior of abortable APIs.
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      return reject(signal.reason);
    }

    const cleanups: VoidFunction[] = [];
    const settle = <T>(fn: (value: T) => void) => (value: T) => {
      cleanups.forEach(cleanup => cleanup());
      fn(value);
    };
    const onResolve = settle(resolve);
    const onReject = settle(reject);

    const isList = Array.isArray(events);
    (isList ? events : [events]).forEach(event => {
      cleanups.push(onEvent(event, payload => {
        const value = (isList ? { event, payload } : payload) as RequestResult<E>;
        try {
          capture(value) && onResolve(ok(value));
        } catch (e) {
          onReject(e);
        }
      }));
    });

    if (timeout) {
      const timeoutId = setTimeout(() => onResolve(err(new TimeoutError(timeout))), timeout);
      cleanups.push(() => clearTimeout(timeoutId));
    }
    if (signal) {
      const onAbort = () => onReject(signal.reason);
      signal.addEventListener('abort', onAbort);
      cleanups.push(() => signal.removeEventListener('abort', onAbort));
    }

    try {
      (postEvent as (method: string, params?: unknown) => void)(method, params);
    } catch (e) {
      onReject(e);
    }
  });
}

/**
 * Calls a Mini Apps method and waits for the specified event (or one of the events) to occur.
 *
 * Throwing version of `safeRequest`.
 * @param method - method name.
 * @param events - event or events to wait for.
 * @param args - additional options.
 * @returns For a single event, its payload. For a list of events, an object with the captured
 * event name and payload.
 * @throws {TimeoutError} The timeout was reached.
 * @example
 * const { button_id } = await request('web_app_open_popup', 'popup_closed', {
 *   params: { title: 'Hello', message: 'World', buttons: [{ id: 'ok', type: 'ok' }] },
 * });
 * @example
 * const result = await request('web_app_request_phone', ['phone_requested'], { timeout: 5000 });
 */
export async function request<M extends MethodName, E extends AnyEventName>(
  method: M,
  events: E,
  ...args: RequestFnArgs<M, E>
): Promise<RequestResult<E>> {
  return unwrap(await safeRequest(method, events, ...args));
}

/**
 * @returns A new unique request identifier. Use it for methods requiring the `req_id` parameter.
 */
export function createRequestId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36)
      .slice(2)}`;
}

/**
 * @returns Function to use in the `request` function `capture` option to capture the event
 * with the specified request identifier.
 * @param reqId - request identifier.
 */
export function captureSameReq(reqId: string): (payload: { req_id: string }) => boolean {
  return payload => payload.req_id === reqId;
}
