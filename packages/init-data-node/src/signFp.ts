import { type InitDataLike, serializeInitDataQuery } from '@tma.js/transformers';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function.js';

import type { Text } from './types.js';

export type SignableData =
  & Omit<InitDataLike, 'auth_date' | 'hash' | 'signature'>
  & { signature?: string };

export interface SignOptions {
  /**
   * True, if token is already hashed and doesn't require hashing using HMAC-SHA-256.
   */
  tokenHashed?: boolean;
}

interface SignDataFpArg<Async extends boolean, Left> {
  (data: Text, key: Text, options?: SignOptions): Async extends true
    ? TE.TaskEither<Left, string>
    : E.Either<Left, string>;
}

/**
 * Signs specified init data.
 * @param data - init data to sign.
 * @param authDate - date, when this init data should be signed.
 * @param key - private key.
 * @param signData - function signing data.
 * @param options - additional options.
 * @returns Signed init data presented as query parameters.
 */
export function signFp<Left>(
  data: SignableData,
  key: Text,
  authDate: Date,
  signData: SignDataFpArg<false, Left>,
  options?: SignOptions,
): E.Either<Left, string>;

/**
 * Signs specified init data.
 * @param data - init data to sign.
 * @param authDate - date, when this init data should be signed.
 * @param key - private key.
 * @param signData - function signing data.
 * @param options - additional options.
 * @returns Signed init data presented as query parameters.
 */
export function signFp<Left>(
  data: SignableData,
  key: Text,
  authDate: Date,
  signData: SignDataFpArg<true, Left>,
  options?: SignOptions,
): TE.TaskEither<Left, string>;

export function signFp<Left>(
  data: SignableData,
  key: Text,
  authDate: Date,
  signData: SignDataFpArg<boolean, Left>,
  options?: SignOptions,
): E.Either<Left, string> | TE.TaskEither<Left, string> {
  const query = new URLSearchParams(serializeInitDataQuery({
    ...data,
    auth_date: authDate,
    signature: data.signature || '',
  }));

  // Convert search params to pairs and sort the final array.
  const pairs = [...query.entries()]
    .map(([name, value]) => `${name}=${value}`)
    .sort();

  // Compute sign, append it to the params and return.
  const queryWithHash = (signature: string): string => {
    query.append('hash', signature);
    return query.toString();
  };

  const eitherHash = signData(pairs.join('\n'), key, options);
  return typeof eitherHash === 'function'
    ? pipe(eitherHash, TE.chain(hash => TE.right(queryWithHash(hash))))
    : pipe(eitherHash, E.chain(hash => E.right(queryWithHash(hash))));
}
