import { BetterPromise, type BetterPromiseRejectReason } from 'better-promises';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function.js';

import {
  AuthDateInvalidError,
  ExpiredError,
  SignatureInvalidError,
  SignatureMissingError,
  HexStringLengthInvalidError,
} from '../errors.js';
import { hashToken as _hashToken } from '../hashToken.js';
import { signDataFp as _signDataFp, SignDataError, type SignDataOptions } from '../signDataFp.js';
import {
  signFp as _signFp,
  type SignableData,
  type SignOptions,
} from '../signFp.js';
import type { CreateHmacFn, Text } from '../types.js';
import {
  validateFp as _validateFp,
  type ValidateValue,
  type ValidateAsyncError,
  type ValidateAsyncOptions,
} from '../validation.js';

const createHmac: CreateHmacFn<true> = async (data, key) => {
  const encoder = new TextEncoder();

  return crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      typeof key === 'string' ? encoder.encode(key) : key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify'],
    ),
    typeof data === 'string' ? encoder.encode(data) : data,
  );
};

/**
 * Hashes specified token using a string, expected during init data sign.
 * @param token - token to hash.
 */
export function hashToken(token: Text): Promise<ArrayBuffer> {
  return _hashToken(token, createHmac);
}

/**
 * @param value - value to check.
 * @param token - bot secret token.
 * @param options - additional validation options.
 * @returns True is specified init data is valid.
 */
export function isValidFp(
  value: ValidateValue,
  token: Text,
  options?: ValidateAsyncOptions,
): TE.TaskEither<BetterPromiseRejectReason, boolean> {
  return pipe(
    validateFp(value, token, options),
    TE.match(
      error => {
        return [
          AuthDateInvalidError,
          ExpiredError,
          SignatureInvalidError,
          SignatureMissingError,
          HexStringLengthInvalidError,
        ].some(errorClass => errorClass.is(error))
          ? E.right(false)
          : E.left(error);
      },
      () => E.right(true),
    ),
  );
}

/**
 * @see isValidFp
 */
export function isValid(
  value: ValidateValue,
  token: Text,
  options?: ValidateAsyncOptions,
): BetterPromise<boolean> {
  return BetterPromise.fn(() => {
    return pipe(
      isValidFp(value, token, options),
      TE.match(error => {
        throw error;
      }, isValid => isValid),
    )();
  });
}

/**
 * Signs specified init data.
 * @param data - init data to sign.
 * @param authDate - date, when this init data should be signed.
 * @param key - private key.
 * @param options - additional options.
 * @returns Signed init data presented as query parameters.
 */
export function signFp(
  data: SignableData,
  key: Text,
  authDate: Date,
  options?: SignOptions,
): TE.TaskEither<SignDataError, string> {
  return _signFp(data, key, authDate, signDataFp, options);
}

/**
 * @see signFp
 */
export function sign(
  data: SignableData,
  key: Text,
  authDate: Date,
  options?: SignOptions,
): BetterPromise<string> {
  return BetterPromise.fn(() => {
    return pipe(
      signFp(data, key, authDate, options),
      TE.match(e => {
        throw e;
      }, v => v),
    )();
  });
}

/**
 * Signs specified data with the passed token.
 * @param data - data to sign.
 * @param key - private key.
 * @param options - additional options.
 * @returns Data sign.
 */
export function signDataFp(
  data: Text,
  key: Text,
  options?: SignDataOptions,
): TE.TaskEither<SignDataError, string> {
  return _signDataFp(true, data, key, createHmac, options);
}

/**
 * @see signDataFp
 */
export function signData(data: Text, key: Text, options?: SignDataOptions): BetterPromise<string> {
  return BetterPromise.fn(() => {
    return pipe(
      signDataFp(data, key, options),
      TE.match(e => {
        throw e;
      }, v => v),
    )();
  });
}

/**
 * Validates passed init data.
 * @param value - value to check.
 * @param token - bot secret token.
 * @param options - additional validation options.
 */
export function validateFp(
  value: ValidateValue,
  token: Text,
  options?: ValidateAsyncOptions,
): TE.TaskEither<ValidateAsyncError, void> {
  return _validateFp(true, value, token, signDataFp, options);
}

/**
 * @see validateFp
 */
export function validate(
  value: ValidateValue,
  token: Text,
  options?: ValidateAsyncOptions,
): BetterPromise<void> {
  return BetterPromise.fn(async () => {
    await pipe(
      validateFp(value, token, options),
      TE.mapLeft(error => {
        throw error;
      }),
    )();
  });
}

export * from './shared.js';
