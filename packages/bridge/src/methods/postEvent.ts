import { either as E, function as fpFn } from 'fp-ts';
import { function as fn, is, looseObject } from 'valibot';

import { hasWebviewProxy } from '@/env/hasWebviewProxy.js';
import { isIframe } from '@/env/isIframe.js';
import { UnknownEnvError } from '@/errors.js';
import { logger, targetOrigin } from '@/globals.js';
import type {
  MethodName,
  MethodNameWithOptionalParams,
  MethodNameWithoutParams,
  MethodNameWithRequiredParams,
  MethodParams,
} from '@/methods/types/index.js';

import { postMessage } from './postMessage.js';

export type PostEventError = UnknownEnvError;
export type PostEventFn = typeof postEvent;
export type PostEventFpFn = typeof postEventFp;

/**
 * @see postEventFp
 */
export function postEvent<Method extends MethodNameWithRequiredParams>(
  method: Method,
  params: MethodParams<Method>,
): void;
/**
 * @see postEventFp
 */
export function postEvent(method: MethodNameWithoutParams): void;
/**
 * @see postEventFp
 */
export function postEvent<Method extends MethodNameWithOptionalParams>(
  method: Method,
  params?: MethodParams<Method>,
): void;

export function postEvent(
  eventType: MethodName,
  eventData?: MethodParams<MethodName>,
): void {
  fpFn.pipe(
    postEventFp(
      // @ts-expect-error It's ok, TS can't determine a specific override.
      eventType,
      eventData,
    ),
    E.mapLeft(err => {
      throw err;
    }),
  );
}

/**
 * Calls Mini Apps methods requiring parameters.
 * @param method - method name.
 * @param params - options along with params.
 */
export function postEventFp<Method extends MethodNameWithRequiredParams>(
  method: Method,
  params: MethodParams<Method>,
): E.Either<PostEventError, void>;

/**
 * Calls Mini Apps methods accepting no parameters at all.
 * @param method - method name.
 */
export function postEventFp(method: MethodNameWithoutParams): E.Either<PostEventError, void>;

/**
 * Calls Mini Apps methods accepting optional parameters.
 * @param method - method name.
 * @param params - options along with params.
 */
export function postEventFp<Method extends MethodNameWithOptionalParams>(
  method: Method,
  params?: MethodParams<Method>,
): E.Either<PostEventError, void>;

export function postEventFp(
  eventType: MethodName,
  eventData?: MethodParams<MethodName>,
): E.Either<PostEventError, void> {
  logger().log('Posting event:', eventData ? { eventType, eventData } : { eventType });

  const w = window;
  const message = JSON.stringify({ eventType, eventData });

  // Telegram Web.
  if (isIframe()) {
    postMessage(message, targetOrigin());
    return E.right(undefined);
  }

  // Telegram for iOS, macOS, Android and Telegram Desktop.
  if (hasWebviewProxy(w)) {
    w.TelegramWebviewProxy.postEvent(eventType, JSON.stringify(eventData));
    return E.right(undefined);
  }

  // Telegram for Windows Phone or Android.
  if (is(looseObject({ external: looseObject({ notify: fn() }) }), w)) {
    w.external.notify(message);
    return E.right(undefined);
  }

  // Otherwise, the current environment is unknown, and we are not able to send event.
  return E.left(new UnknownEnvError());
}
