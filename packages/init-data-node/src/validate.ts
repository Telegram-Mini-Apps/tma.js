import type { InitData, InitDataParsed } from '@telegram-apps/sdk';

import { initDataToSearchParams } from './initDataToSearchParams.js';
import type { SignDataAsyncFn, SignDataSyncFn } from './types.js';

export interface ValidateOptions {
  /**
   * Time in seconds which states, how long from creation time init data is considered valid.
   *
   * In other words, in case when authDate + expiresIn is before current time, init data is
   * recognized as expired.
   *
   * In case this value is equal to 0, the function does not check init data expiration.
   * @default 86400 (1 day)
   */
  expiresIn?: number;
}

function processSign(actual: string, expected: string): void | never {
  if (actual !== expected) {
    throw new Error('Signature is invalid');
  }
  return;
}

/**
 * Validates passed init data.
 * @param value - value to check.
 * @param token - bot secret token.
 * @param signData - function signing data.
 * @param options - additional validation options.
 * @throws {TypeError} "auth_date" should present integer
 * @throws {Error} "hash" is empty or not found
 * @throws {Error} "auth_date" is empty or not found
 * @throws {Error} Init data expired
 */
export function validate(
  value: InitData | InitDataParsed | string | URLSearchParams,
  token: string,
  signData: SignDataSyncFn,
  options?: ValidateOptions,
): void | never;

/**
 * Validates passed init data.
 * @param value - value to check.
 * @param token - bot secret token.
 * @param signData - function signing data.
 * @param options - additional validation options.
 * @throws {TypeError} "auth_date" should present integer
 * @throws {Error} "hash" is empty or not found
 * @throws {Error} "auth_date" is empty or not found
 * @throws {Error} Init data expired
 */
export function validate(
  value: InitData | InitDataParsed | string | URLSearchParams,
  token: string,
  signData: SignDataAsyncFn,
  options?: ValidateOptions,
): Promise<void>;

export function validate(
  value: InitData | InitDataParsed | string | URLSearchParams,
  token: string,
  signData: SignDataSyncFn | SignDataAsyncFn,
  options: ValidateOptions = {},
): void | never | Promise<void> {
  // Init data required params.
  let authDate: Date | undefined;
  let hash: string | undefined;

  // All search params pairs presented as `k=v`.
  const pairs: string[] = [];

  // Iterate over all key-value pairs of parsed parameters and find required
  // parameters.
  new URLSearchParams(
    typeof value === 'string' || value instanceof URLSearchParams
      ? value
      : initDataToSearchParams(value),
  ).forEach((value, key) => {
    if (key === 'hash') {
      hash = value;
      return;
    }

    if (key === 'auth_date') {
      const authDateNum = parseInt(value, 10);

      if (Number.isNaN(authDateNum)) {
        throw new TypeError('"auth_date" should present integer');
      }
      authDate = new Date(authDateNum * 1000);
    }

    pairs.push(`${key}=${value}`);
  });

  // Hash and auth date always required.
  if (!hash) {
    throw new Error('"hash" is empty or not found');
  }

  if (!authDate) {
    throw new Error('"auth_date" is empty or not found');
  }

  // In case, expiration time passed, we do additional parameters check.
  const { expiresIn = 86400 } = options;
  if (expiresIn > 0) {
    // Check if init data expired.
    if (+authDate + expiresIn * 1000 < Date.now()) {
      throw new Error('Init data expired');
    }
  }

  // According to docs, we sort all the pairs in alphabetical order.
  pairs.sort();

  const sign = signData(pairs.join('\n'), token);

  return typeof sign === 'string'
    ? processSign(sign, hash)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    : sign.then(v => processSign(v, hash as string));
}
