import { signal } from '@tma.js/signals';
import {
  createCbCollector,
  throwifyAnyEither,
  type If,
  type IsNever,
  BetterTaskEither,
} from '@tma.js/toolkit';
import {
  BetterPromise,
  type BetterPromiseOptions,
  type TimeoutError,
} from 'better-promises';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import { on } from '@/events/emitter.js';
import type { EventName, EventPayload } from '@/events/types/index.js';
import {
  postEventFp,
  type PostEventError,
  type PostEventFn,
  type PostEventFpFn,
} from '@/methods/postEvent.js';
import type {
  MethodName,
  MethodNameWithOptionalParams,
  MethodNameWithoutParams,
  MethodNameWithRequiredParams,
  MethodParams,
} from '@/methods/types/index.js';

type AnyEventName = EventName | EventName[];

export type RequestError = PostEventError | TimeoutError;

/**
 * @example
 * { event: 'scan_qr_closed' }
 * @example
 * {
 *   event: 'popup_closed',
 *   payload: { button_id: 'ok' }
 * }
 */
export type RequestCaptureFnEventsPayload<E extends EventName[]> =
  E extends (infer U extends EventName)[]
    ? {
      [K in U]: If<
        IsNever<EventPayload<K>>,
        { event: K },
        { event: K; payload: EventPayload<K> }
      >
    }[U]
    : never;

export type RequestCaptureEventsFn<E extends EventName[]> = (
  payload: RequestCaptureFnEventsPayload<E>,
) => boolean;

export type RequestCaptureEventFn<E extends EventName> = If<
  IsNever<EventPayload<E>>,
  () => boolean,
  (payload: EventPayload<E>) => boolean
>;

export type RequestCaptureFn<E extends AnyEventName> = E extends EventName[]
  ? RequestCaptureEventsFn<E>
  : E extends EventName
    ? RequestCaptureEventFn<E>
    : never;

export interface RequestOptions<E extends AnyEventName> extends Omit<RequestFpOptions<E>, 'postEvent'> {
  /**
   * Custom function to call mini apps methods.
   */
  postEvent?: PostEventFn;
}

export type RequestResult<E extends AnyEventName> =
  E extends (infer U extends EventName)[]
    ? U extends infer K extends EventName
      ? If<IsNever<EventPayload<K>>, undefined, EventPayload<K>>
      : never
    : E extends EventName
      ? If<IsNever<EventPayload<E>>, undefined, EventPayload<E>>
      : never;

export interface RequestFpOptions<E extends AnyEventName> extends Pick<
  BetterPromiseOptions,
  'abortSignal' | 'timeout'
> {
  /**
   * A function that should return true if the event should be captured.
   * The first compatible request will be captured if this property is omitted.
   */
  capture?: RequestCaptureFn<E>;
  /**
   * A custom function to call mini apps methods.
   */
  postEvent?: PostEventFpFn;
}

export type RequestFn = typeof request;
export type RequestFpFn = typeof requestFp;

/**
 * Calls a method waiting for the specified event(-s) to occur.
 * @param method - method name.
 * @param eventOrEvents - tracked event or events.
 * @param options - additional options.
 * @deprecated To be removed in the next major update. Use `request2fp` instead, it provides
 * a proper way of handling multiple events.
 */
export function requestFp<
  M extends MethodNameWithRequiredParams,
  E extends AnyEventName,
  AbortError = never,
>(
  method: M,
  eventOrEvents: E,
  options: RequestFpOptions<E> & { params: MethodParams<M> },
): TE.TaskEither<RequestError | AbortError, RequestResult<E>>;

/**
 * Calls a method waiting for the specified event(-s) to occur.
 * @param method - method name.
 * @param eventOrEvents - tracked event or events.
 * @param options - additional options.
 * @deprecated To be removed in the next major update. Use `request2fp` instead, it provides
 * a proper way of handling multiple events.
 */
export function requestFp<
  M extends MethodNameWithOptionalParams,
  E extends AnyEventName,
  AbortError = never,
>(
  method: M,
  eventOrEvents: E,
  options?: RequestFpOptions<E> & { params?: MethodParams<M> },
): TE.TaskEither<RequestError | AbortError, RequestResult<E>>;

/**
 * Calls a method waiting for the specified event(-s) to occur.
 * @param method - method name.
 * @param eventOrEvents - tracked event or events.
 * @param options - additional options.
 * @deprecated To be removed in the next major update. Use `request2fp` instead, it provides
 * a proper way of handling multiple events.
 */
export function requestFp<
  M extends MethodNameWithoutParams,
  E extends AnyEventName,
  AbortError = never,
>(
  method: M,
  eventOrEvents: E,
  options?: RequestFpOptions<E>,
): TE.TaskEither<RequestError | AbortError, RequestResult<E>>;

export function requestFp<
  M extends MethodName,
  E extends AnyEventName,
  AbortError = never,
>(
  method: M,
  eventOrEvents: E,
  options: RequestFpOptions<E> & { params?: MethodParams<M> } = {},
): TE.TaskEither<RequestError | AbortError, RequestResult<E>> {
  const {
    // If no capture function was passed, we capture the first compatible event.
    capture = () => true,
    postEvent = postEventFp,
  } = options;

  const result = signal<undefined | [RequestResult<E>]>();
  const [addCleanup, cleanup] = createCbCollector();
  // Iterate over all the tracked events and add a listener, checking if the event should be
  // captured.
  (Array.isArray(eventOrEvents) ? eventOrEvents : [eventOrEvents]).forEach(event => {
    // Each event listener waits for the event to occur.
    // Then, if the capture function was passed, we should check if the event should
    // be captured. If the function is omitted, we instantly capture the event.
    addCleanup(
      on(event, payload => {
        if (
          Array.isArray(eventOrEvents)
            ? (capture as RequestCaptureEventsFn<EventName[]>)({ event, payload })
            : (capture as RequestCaptureEventFn<EventName>)(payload)
        ) {
          result.set([payload as RequestResult<E>]);
        }
      }),
    );
  });
  const withCleanup = <T>(value: T): T => {
    cleanup();
    return value;
  };

  return pipe(
    async () => postEvent(method as any, (options as any).params),
    TE.chainW(() => {
      return BetterTaskEither<AbortError, RequestResult<E>>((resolve, _, context) => {
        // When creating this BetterTaskEither, we could already have a value stored in
        // the result signal. For example, when tracked events were generated via emitEvent in
        // mockTelegramEnv.onEvent.
        const data = result();
        if (data) {
          return resolve(data[0]);
        }

        const listener = (data: [RequestResult<E>] | undefined) => {
          if (data) {
            resolve(data[0]);
          }
        };
        const unsub = () => {
          result.unsub(listener);
        };
        result.sub(listener);
        context.on('finalized', unsub);
      }, options);
    }),
    TE.mapBoth(withCleanup, withCleanup),
  );
}

/**
 * @see requestFp
 * @deprecated To be removed in the next major update. Use `request2` instead, it provides
 * a proper way of handling multiple events.
 */
export function request<M extends MethodNameWithRequiredParams, E extends AnyEventName>(
  method: M,
  eventOrEvents: E,
  options: RequestOptions<E> & { params: MethodParams<M> },
): BetterPromise<RequestResult<E>>;

/**
 * @see requestFp
 * @deprecated To be removed in the next major update. Use `request2` instead, it provides
 * a proper way of handling multiple events.
 */
export function request<M extends MethodNameWithOptionalParams, E extends AnyEventName>(
  method: M,
  eventOrEvents: E,
  options?: RequestOptions<E> & { params?: MethodParams<M> },
): BetterPromise<RequestResult<E>>;

/**
 * @see requestFp
 * @deprecated To be removed in the next major update. Use `request2` instead, it provides
 * a proper way of handling multiple events.
 */
export function request<M extends MethodNameWithoutParams, E extends AnyEventName>(
  method: M,
  eventOrEvents: E,
  options?: RequestOptions<E>,
): BetterPromise<RequestResult<E>>;

export function request<M extends MethodName, E extends AnyEventName>(
  method: M,
  eventOrEvents: E,
  options?: RequestOptions<E> & { params?: MethodParams<M> },
): BetterPromise<RequestResult<E>> {
  const { postEvent } = options || {};

  return throwifyAnyEither(
    // @ts-expect-error TypeScript will not be able to handle our overrides here.
    requestFp(method, eventOrEvents, {
      ...options,
      postEvent: postEvent
        ? (...args: any[]) => {
          try {
            // @ts-expect-error TypeScript will not be able to handle our overrides here.
            postEvent(...args);
            return E.right(undefined);
          } catch (e) {
            return E.left(e);
          }
        }
        : postEventFp,
    }),
  );
}
