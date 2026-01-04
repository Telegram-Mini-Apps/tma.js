import { throwifyAnyEither } from '@tma.js/toolkit';
import {
  BetterPromise,
  type BetterPromiseOptions,
  TimeoutError,
} from 'better-promises';
import { either as E, taskEither as TE, function as fn } from 'fp-ts';

import { hasWebviewProxy } from '@/env/hasWebviewProxy.js';
import { UnknownEnvError } from '@/errors.js';
import { retrieveRawLaunchParamsFp } from '@/launch-params.js';
import { type Request2Error, request2Fp } from '@/utils/request2.js';

export type isTMAError = Exclude<Request2Error, TimeoutError>;

/**
 * @see isTMAFp
 */
export function isTMA(): boolean;
/**
 * @see isTMAFp
 */
export function isTMA(type: 'complete', options?: BetterPromiseOptions): BetterPromise<boolean>;
export function isTMA(
  type?: 'complete',
  options?: BetterPromiseOptions,
): boolean | BetterPromise<boolean> {
  const monad = isTMAFp(
    // @ts-expect-error TS doesn't get what override we are going to use.
    type,
    options,
  );
  return typeof monad === 'function'
    ? BetterPromise.fn(() => throwifyAnyEither(monad as TE.TaskEither<any, boolean>))
    : monad;
}

/**
 * Returns true if the current environment is Telegram Mini Apps.
 *
 * It uses the `retrieveLaunchParams` function to determine if the environment
 * contains launch parameters. In case it does, true will be returned.
 *
 * In case you need stricter checks, use async override of this function.
 */
export function isTMAFp(): boolean;
/**
 * Returns promise with true if the current environment is Telegram Mini Apps.
 *
 * First of all, it checks if the current environment contains traits specific
 * to the Mini Apps environment. Then, it attempts to call a Mini Apps method
 * and waits for a response to be received.
 *
 * In case you need less strict checks, use sync override of this function.
 */
export function isTMAFp(
  type: 'complete',
  options?: BetterPromiseOptions,
): TE.TaskEither<isTMAError, boolean>;
export function isTMAFp(
  type?: 'complete',
  options?: BetterPromiseOptions,
): boolean | TE.TaskEither<isTMAError, boolean> {
  const hasProxy = hasWebviewProxy(window);
  if (!type) {
    return hasProxy || fn.pipe(retrieveRawLaunchParamsFp(), E.match(() => false, () => true));
  }
  if (hasProxy) {
    return TE.right(true);
  }
  const { timeout = 100 } = options || {};

  return fn.pipe(
    request2Fp('web_app_request_theme', 'theme_changed', { ...options, timeout }),
    TE.match(
      error => (
        TimeoutError.is(error) || UnknownEnvError.is(error)
          ? E.right(false)
          : E.left(error)
      ),
      () => E.right(true),
    ),
  );
}
