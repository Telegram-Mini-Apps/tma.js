import { throwifyFpFn, throwifyAnyEither } from '@tma.js/toolkit';
import * as E from 'fp-ts/Either';
import * as J from 'fp-ts/Json';
import { pipe } from 'fp-ts/function';

import { encodeBase64Url, type DecodeBase64UrlError, decodeBase64UrlFp } from '@/base64-url.js';

/**
 * Creates a safe start parameter value. If the value is not a string, the
 * function applies JSON.stringify to it, so make sure you are not passing an
 * object with circular references.
 *
 * @param value - value to create start parameter from.
 * @see Learn more about start parameter:
 * https://docs.telegram-mini-apps.com/platform/start-parameter
 */
export function createStartParamFp(value: unknown): E.Either<Error, string> {
  const b64 = encodeBase64Url(typeof value === 'string' ? value : JSON.stringify(value));
  return b64.length > 512
    ? E.left(new Error('Value is too long for start parameter'))
    : E.right(b64);
}

/**
 * @see createStartParamFp
 */
export const createStartParam = throwifyFpFn(createStartParamFp);

/**
 * @see decodeStartParamFp
 */
export function decodeStartParam<T>(value: string, parse: (value: string) => T): T;
/**
 * @see decodeStartParamFp
 */
export function decodeStartParam(value: string, as: 'json'): J.Json;
/**
 * @see decodeStartParamFp
 */
export function decodeStartParam(value: string): string;
export function decodeStartParam<T>(
  value: string,
  arg2?: 'json' | ((value: string) => T),
): string | unknown | T {
  return throwifyAnyEither(
    decodeStartParamFp(
      value,
      // @ts-expect-error TypeScript is unable to detect a correct override.
      typeof arg2 === 'function'
        ? (value: string) => E.tryCatch(() => arg2(value), e => e)
        : arg2,
    ),
  );
}

/**
 * Decodes a start parameter using a custom parser.
 * @param value - a start parameter value.
 * @param parse - a custom value parser.
 */
export function decodeStartParamFp<L, R>(
  value: string,
  parse: (value: string) => E.Either<L, R>,
): E.Either<L | DecodeBase64UrlError, R>;
/**
 * Decodes a start parameter assuming that the result is a JSON value.
 * @param value - a start parameter value.
 * @param as - result kind.
 */
export function decodeStartParamFp(
  value: string,
  as: 'json',
): E.Either<SyntaxError | DecodeBase64UrlError, J.Json>;
/**
 * Decodes a start parameter and returns its decoded representation.
 * @param value - a value to decode.
 */
export function decodeStartParamFp(value: string): E.Either<DecodeBase64UrlError, string>;
export function decodeStartParamFp<L, R>(
  value: string,
  arg2?: 'json' | ((value: string) => E.Either<L, R>),
): E.Either<DecodeBase64UrlError | SyntaxError | L, R | string | J.Json> {
  return pipe(
    decodeBase64UrlFp(value),
    E.chain<DecodeBase64UrlError | SyntaxError | L, string, R | string | J.Json>(decoded => {
      if (!arg2) {
        return E.right(decoded);
      }
      if (typeof arg2 === 'function') {
        return arg2(decoded);
      }
      return J.parse(decoded) as E.Either<SyntaxError, J.Json>;
    }),
  );
}

/**
 * @returns True if the passed value is safe to be used to create a start parameter value from it.
 * If true is returned, the value can be safely passed to the `createStartParam` function.
 * @param value - value to check.
 * @see createStartParam
 */
export function isSafeToCreateStartParam(value: string): boolean {
  return encodeBase64Url(value).length <= 512;
}
