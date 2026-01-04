import { either as E, taskEither as TE, function as fn } from 'fp-ts';

import { arrayBufferToHex, hexToArrayBuffer } from './buf-converters.js';
import { hashToken } from './hashToken.js';
import type { CreateHmacFn, Text } from './types.js';

export interface SignDataOptions {
  /**
   * True, if token is already hashed and doesn't require hashing using HMAC-SHA-256.
   */
  tokenHashed?: boolean;
}

export type SignDataError = ReturnType<typeof hexToArrayBuffer> extends E.Either<infer U, any>
  ? U
  : never;

export function signDataFp(
  async: false,
  data: Text,
  key: Text,
  createHmac: CreateHmacFn<false>,
  options?: SignDataOptions,
): E.Either<SignDataError, string>;

export function signDataFp(
  async: true,
  data: Text,
  key: Text,
  createHmac: CreateHmacFn<true>,
  options?: SignDataOptions,
): TE.TaskEither<SignDataError, string>;

export function signDataFp(
  async: boolean,
  data: Text,
  key: Text,
  createHmac: CreateHmacFn<boolean>,
  options: SignDataOptions = {},
):
  | E.Either<SignDataError, string>
  | TE.TaskEither<SignDataError, string> {
  const keyHmac = options.tokenHashed
    ? typeof key === 'string'
      // If a hashed token was passed, we assume that it is a HEX string. Not to mess with
      // the createHmac function, we should convert this HEX string to ArrayBuffer. Otherwise,
      // incorrect behavior will be met.
      ? hexToArrayBuffer(key)
      : E.right(key)
    // Otherwise we are hashing the token, but we want it to be a monad.
    : fn.pipe(
      E.right(hashToken(key, createHmac)),
      E.match(() => null as never, v => {
        return v instanceof Promise
          ? TE.tryCatch(() => v, err => err as never)
          : E.right(v);
      }),
    );

  if (async || typeof keyHmac === 'function') {
    return fn.pipe(
      typeof keyHmac === 'function' ? keyHmac : TE.fromEither(keyHmac),
      TE.chainW(v => TE.tryCatch(
        () => Promise.resolve(createHmac(data, v)).then(arrayBufferToHex),
        err => err as never,
      )),
    );
  }
  return fn.pipe(
    keyHmac,
    // In this branch createHmac can't be asynchronous. If it is, keyHmac would be Promise and the
    // result would be returned in the previous "if" statement.
    E.chain(v => E.right(
      arrayBufferToHex((createHmac as CreateHmacFn<false>)(data, v)),
    )),
  );
}
