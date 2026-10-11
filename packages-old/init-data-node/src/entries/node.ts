import { either as E, function as fn } from 'fp-ts';
import { createHmac as nodeCreateHmac } from 'node:crypto';

import { bufferToArrayBuffer } from '../buf-converters.js';
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
  type ValidateError,
  type ValidateOptions,
  type ValidateValue,
} from '../validation.js';

/**
 * Converts Text to NodE.js Buffer.
 * @param text - text to convert
 */
function textToBuffer(text: Text): Buffer {
  return Buffer.from(typeof text === 'string' ? text : new Uint8Array(text));
}

const createHmac: CreateHmacFn<false> = (data, key) => {
  return bufferToArrayBuffer(
    nodeCreateHmac('sha256', textToBuffer(key))
      .update(textToBuffer(data))
      .digest(),
  );
};

/**
 * Hashes specified token using a string, expected during init data sign.
 * @param token - token to hash.
 */
export function hashToken(token: Text): Buffer {
  return Buffer.from(_hashToken(token, createHmac));
}

/**
 * @param value - value to check.
 * @param token - bot secret token.
 * @param options - additional validation options.
 * @returns True is specified init data is valid.
 */
export function isValid(value: ValidateValue, token: Text, options?: ValidateOptions): boolean {
  return fn.pipe(
    validateFp(value, token, options),
    E.match(() => false, () => true),
  );
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
): E.Either<SignDataError, string> {
  return _signFp(data, key, authDate, signDataFp, options);
}

/**
 * @see signFp
 */
export function sign(data: SignableData, key: Text, authDate: Date, options?: SignOptions): string {
  return fn.pipe(
    signFp(data, key, authDate, options),
    E.match(e => {
      throw e;
    }, v => v),
  );
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
): E.Either<SignDataError, string> {
  return _signDataFp(false, data, key, createHmac, options);
}

/**
 * @see signDataFp
 */
export function signData(data: Text, key: Text, options?: SignDataOptions): string {
  return fn.pipe(
    signDataFp(data, key, options),
    E.match(e => {
      throw e;
    }, v => v),
  );
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
  options?: ValidateOptions,
): E.Either<ValidateError, void> {
  return _validateFp(false, value, token, signDataFp, options);
}

/**
 * @see validateFp
 */
export function validate(value: ValidateValue, token: Text, options?: ValidateOptions): void {
  fn.pipe(
    validateFp(value, token, options),
    E.mapLeft(error => {
      throw error;
    }),
  );
}

export * from './shared.js';
