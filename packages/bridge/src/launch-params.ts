import { throwifyFpFn, getStorageValue, setStorageValue } from '@tma.js/toolkit';
import {
  parseLaunchParamsQueryFp,
  type LaunchParamsGenType,
  type ParseLaunchParamsQueryError,
} from '@tma.js/transformers';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';

import { LaunchParamsRetrieveError } from '@/errors.js';

const SESSION_STORAGE_KEY = 'launchParams';

export type RetrieveRawInitDataError = RetrieveRawLaunchParamsError;
export type RetrieveRawLaunchParamsError = LaunchParamsRetrieveError;
export type RetrieveLaunchParamsError = RetrieveRawLaunchParamsError | ParseLaunchParamsQueryError;
export type RetrieveLaunchParamsResult = LaunchParamsGenType;

/**
 * @param urlString - URL to extract launch parameters from.
 * @returns Launch parameters from the specified URL.
 * @throws Error if function was unable to extract launch parameters from the
 *   passed URL.
 */
function retrieveLpFromUrl(urlString: string): string {
  return urlString
    // Replace everything before this first hashtag or question sign.
    .replace(/^[^?#]*[?#]/, '')
    // Replace all hashtags and question signs to make it look like some search
    // params.
    .replace(/[?#]/g, '&');
}

/**
 * @returns Launch parameters from any known source.
 */
export function retrieveLaunchParamsFp(): E.Either<
  RetrieveLaunchParamsError,
  RetrieveLaunchParamsResult
> {
  return pipe(
    retrieveRawLaunchParamsFp(),
    E.chainW(parseLaunchParamsQueryFp),
  );
}

/**
 * @see retrieveLaunchParamsFp
 */
export const retrieveLaunchParams: () => RetrieveLaunchParamsResult =
  throwifyFpFn(retrieveLaunchParamsFp);

/**
 * @returns Raw init data from any known source.
 */
export function retrieveRawInitDataFp(): E.Either<RetrieveRawInitDataError, O.Option<string>> {
  return pipe(
    retrieveRawLaunchParamsFp(),
    E.map(raw => {
      const v = new URLSearchParams(raw).get('tgWebAppData');
      return v ? O.some(v) : O.none;
    }),
  );
}

/**
 * @see retrieveRawInitDataFp
 */
export function retrieveRawInitData(): string | undefined {
  return pipe(
    retrieveRawInitDataFp(),
    E.fold(err => {
      throw err;
    }, v => v),
    O.match(() => undefined, v => v),
  );
}

/**
 * @returns Launch parameters in a raw format from any known source.
 */
export function retrieveRawLaunchParamsFp(): E.Either<RetrieveRawLaunchParamsError, string> {
  const errors: { source: string; error: unknown }[] = [];

  for (const [retrieve, source] of [
    // Try to retrieve launch parameters from the current location. This method
    // can return nothing in case, location was changed, and then the page was
    // reloaded.
    [() => retrieveLpFromUrl(window.location.href), 'window.location.href'],
    // Then, try using the lower level API - window.performance.
    [() => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      return navigationEntry && retrieveLpFromUrl(navigationEntry.name);
    }, 'performance navigation entries'],
    // Finally, try using the session storage.
    [() => getStorageValue<string>(SESSION_STORAGE_KEY), 'local storage'],
  ] as const) {
    const v = retrieve();
    if (!v) {
      errors.push({ source, error: new Error('Source is empty') });
      continue;
    }
    const maybeError = pipe(
      parseLaunchParamsQueryFp(v),
      E.foldW(err => err, () => true as const),
    );
    if (typeof maybeError !== 'boolean') {
      errors.push({ source, error: maybeError });
      continue;
    }
    setStorageValue(SESSION_STORAGE_KEY, v);
    return E.right(v);
  }
  return E.left(new LaunchParamsRetrieveError(errors));
}

/**
 * @see retrieveRawLaunchParamsFp
 */
export const retrieveRawLaunchParams = throwifyFpFn(retrieveRawLaunchParamsFp);
