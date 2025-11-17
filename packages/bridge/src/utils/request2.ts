import { signal } from '@tma.js/signals';
import {
  BetterTaskEither,
  type If,
  type IsNever,
  createCbCollector,
  throwifyAnyEither,
} from '@tma.js/toolkit';
import { BetterPromise } from 'better-promises';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import { on } from '@/events/emitter.js';
import type { EventName, EventPayload } from '@/events/types/index.js';
import { postEventFp } from '@/methods/postEvent.js';
import type {
  MethodName,
  MethodNameWithOptionalParams,
  MethodNameWithRequiredParams,
  MethodNameWithoutParams,
  MethodParams,
} from '@/methods/types/index.js';

import type {
  RequestCaptureEventFn,
  RequestCaptureEventsFn,
  RequestCaptureFn,
  RequestError,
  RequestFpOptions,
  RequestOptions,
  RequestCaptureFnEventsPayload,
} from './request.js';

type AnyEventName = EventName | EventName[];

export type Request2Error = RequestError;
export type Request2CaptureEventsFn<E extends EventName[]> = RequestCaptureEventsFn<E>;
export type Request2CaptureEventFn<E extends EventName> = RequestCaptureEventFn<E>;
export type Request2CaptureFn<E extends AnyEventName> = RequestCaptureFn<E>;
export type Request2Options<E extends AnyEventName> = RequestOptions<E>;
export type Request2FpOptions<E extends AnyEventName> = RequestFpOptions<E>;
export type Request2CaptureFnEventsPayload<E extends EventName[]> =
  RequestCaptureFnEventsPayload<E>;
export type Request2Result<E extends AnyEventName> =
  E extends (infer U extends EventName)[]
    ? U extends infer K extends EventName
      ? { event: K; payload: If<IsNever<EventPayload<K>>, undefined, EventPayload<K>> }
      : never
    : E extends EventName
      ? If<IsNever<EventPayload<E>>, undefined, EventPayload<E>>
      : never;

export type Request2Fn = typeof request2;
export type Request2FpFn = typeof request2Fp;

/**
 * Calls a method waiting for the specified event(-s) to occur.
 * @param method - method name.
 * @param eventOrEvents - tracked event or events.
 * @param options - additional options.
 */
export function request2Fp<
  M extends MethodNameWithRequiredParams,
  E extends AnyEventName,
  AbortError = never,
>(
  method: M,
  eventOrEvents: E,
  options: Request2FpOptions<E> & { params: MethodParams<M> },
): TE.TaskEither<Request2Error | AbortError, Request2Result<E>>;

/**
 * Calls a method waiting for the specified event(-s) to occur.
 * @param method - method name.
 * @param eventOrEvents - tracked event or events.
 * @param options - additional options.
 */
export function request2Fp<
  M extends MethodNameWithOptionalParams,
  E extends AnyEventName,
  AbortError = never,
>(
  method: M,
  eventOrEvents: E,
  options?: Request2FpOptions<E> & { params?: MethodParams<M> },
): TE.TaskEither<Request2Error | AbortError, Request2Result<E>>;

/**
 * Calls a method waiting for the specified event(-s) to occur.
 * @param method - method name.
 * @param eventOrEvents - tracked event or events.
 * @param options - additional options.
 */
export function request2Fp<
  M extends MethodNameWithoutParams,
  E extends AnyEventName,
  AbortError = never,
>(
  method: M,
  eventOrEvents: E,
  options?: Request2FpOptions<E>,
): TE.TaskEither<Request2Error | AbortError, Request2Result<E>>;

export function request2Fp<
  M extends MethodName,
  E extends AnyEventName,
  AbortError = never,
>(
  method: M,
  eventOrEvents: E,
  options: Request2FpOptions<E> & { params?: MethodParams<M> } = {},
): TE.TaskEither<Request2Error | AbortError, Request2Result<E>> {
  const {
    // If no capture function was passed, we capture the first compatible event.
    capture = () => true,
    postEvent = postEventFp,
  } = options;

  // TODO: Maybe we want to rewrite it using a simple BetterPromise.

  const result = signal<undefined | [Request2Result<E>]>();
  const [addCleanup, cleanup] = createCbCollector();
  // Iterate over all the tracked events and add a listener, checking if the event should be
  // captured.
  (Array.isArray(eventOrEvents) ? eventOrEvents : [eventOrEvents]).forEach(event => {
    // Each event listener waits for the event to occur.
    // Then, if the capture function was passed, we should check if the event should
    // be captured. If the function is omitted, we instantly capture the event.
    addCleanup(
      on(event, payload => {
        const isEventsArray = Array.isArray(eventOrEvents);
        if (
          isEventsArray
            ? (capture as Request2CaptureEventsFn<EventName[]>)({ event, payload })
            : (capture as Request2CaptureEventFn<EventName>)(payload)
        ) {
          result.set([
            (isEventsArray ? { event, payload } : payload) as Request2Result<E>,
          ]);
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
      return BetterTaskEither<AbortError, Request2Result<E>>((resolve, _, context) => {
        // When creating this BetterTaskEither, we could already have a value stored in
        // the result signal. For example, when tracked events were generated via emitEvent in
        // mockTelegramEnv.onEvent.
        const data = result();
        if (data) {
          return resolve(data[0]);
        }

        const listener = (data: [Request2Result<E>] | undefined) => {
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
 * @see request2Fp
 */
export function request2<M extends MethodNameWithRequiredParams, E extends AnyEventName>(
  method: M,
  eventOrEvents: E,
  options: Request2Options<E> & { params: MethodParams<M> },
): BetterPromise<Request2Result<E>>;

/**
 * @see request2Fp
 */
export function request2<M extends MethodNameWithOptionalParams, E extends AnyEventName>(
  method: M,
  eventOrEvents: E,
  options?: Request2Options<E> & { params?: MethodParams<M> },
): BetterPromise<Request2Result<E>>;

/**
 * @see request2Fp
 */
export function request2<M extends MethodNameWithoutParams, E extends AnyEventName>(
  method: M,
  eventOrEvents: E,
  options?: Request2Options<E>,
): BetterPromise<Request2Result<E>>;

export function request2<M extends MethodName, E extends AnyEventName>(
  method: M,
  eventOrEvents: E,
  options?: Request2Options<E> & { params?: MethodParams<M> },
): BetterPromise<Request2Result<E>> {
  const { postEvent } = options || {};

  return throwifyAnyEither(
    // @ts-expect-error TypeScript will not be able to handle our overrides here.
    request2Fp(method, eventOrEvents, {
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
