import {
  BetterPromise,
  type BetterPromiseOptions,
  type BetterPromiseRejectReason,
} from 'better-promises';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import {
  AuthDateInvalidError,
  ExpiredError,
  SignatureInvalidError,
  SignatureMissingError,
} from './errors.js';
import { Text } from './types.js';

type OmittedPromiseOptions = Omit<BetterPromiseOptions, 'abortOnResolve' | 'abortOnReject'>;

export type ValidateValue = string | URLSearchParams;
export type Validate3rdValue = string | URLSearchParams;

export type ValidateError =
  | SignatureMissingError
  | SignatureInvalidError
  | AuthDateInvalidError
  | ExpiredError;
export type ValidateAsyncError = ValidateError | BetterPromiseRejectReason;
export type Validate3rdError =
  | SignatureMissingError
  | SignatureInvalidError
  | AuthDateInvalidError
  | ExpiredError
  | BetterPromiseRejectReason;

interface ValidateSignDataFpArg<Async extends boolean, Left> {
  (data: Text, key: Text, options?: ValidateOptions): Async extends true
    ? TE.TaskEither<Left, string>
    : E.Either<Left, string>;
}

interface SharedValidateOptions {
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

export interface ValidateOptions extends SharedValidateOptions {
  /**
   * True, if token is already hashed.
   * @default false
   */
  tokenHashed?: boolean;
}

export interface ValidateAsyncOptions extends ValidateOptions, OmittedPromiseOptions {
}

export interface Validate3rdOptions extends SharedValidateOptions, OmittedPromiseOptions {
  /**
   * When true, uses the test environment public key to validate init data.
   * @default false
   */
  test?: boolean;
}

/**
 * Validates passed init data using a publicly known Ee25519 key.
 * @param value - value to check.
 * @param botId - bot identifier
 * @param options - additional validation options.
 */
export function validate3rdFp(
  value: Validate3rdValue,
  botId: number,
  options: Validate3rdOptions = {},
): TE.TaskEither<Validate3rdError, void> {
  // Init data required params.
  let authDate: Date | undefined;
  let authDateString: string | undefined;
  let signature: string | undefined;

  // All search params pairs presented as `k=v`.
  const pairs: string[] = [];

  // Iterate over all key-value pairs of parsed parameters and find required
  // parameters.
  (typeof value === 'string' ? new URLSearchParams(value) : value).forEach((value, key) => {
    if (key === 'hash') {
      return;
    }
    if (key === 'signature') {
      signature = value;
      return;
    }
    if (key === 'auth_date') {
      authDateString = value;
      const authDateNum = parseInt(value, 10);
      if (!Number.isNaN(authDateNum)) {
        authDate = new Date(authDateNum * 1000);
      }
    }

    pairs.push(`${key}=${value}`);
  });

  // Signature and auth date always required.
  if (!signature) {
    return TE.left(new SignatureMissingError(true));
  }

  if (!authDate) {
    return TE.left(new AuthDateInvalidError(authDateString));
  }

  // In case, expiration time passed, we do additional parameters check.
  const { expiresIn = 86400 } = options;
  if (expiresIn > 0) {
    // Check if init data expired.
    const expiresAtTs = authDate.getTime() + (expiresIn * 1000);
    const nowTs = Date.now();
    if (expiresAtTs < nowTs) {
      return TE.left(new ExpiredError(authDate, new Date(expiresAtTs), new Date(nowTs)));
    }
  }

  return pipe(
    TE.tryCatch(
      () => {
        return BetterPromise.fn(async () => {
          return crypto.subtle.verify(
            'Ed25519',
            await crypto.subtle.importKey(
              'raw',
              Buffer.from(
                options.test
                  ? '40055058a4ee38156a06562e52eece92a771bcd8346a8c4615cb7376eddf72ec'
                  : 'e7bf03a2fa4602af4580703d88dda5bb59f32ed8b02a56c187fe7d34caed242d',
                'hex',
              ),
              'Ed25519',
              false,
              ['verify'],
            ),
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            Buffer.from(signature as string, 'base64'),
            Buffer.from(`${botId}:WebAppData\n${pairs.sort().join('\n')}`),
          );
        }, options);
      },
      (e: unknown) => e,
    ),
    TE.chainW(isVerified => {
      return isVerified ? TE.right(undefined) : TE.left(new SignatureInvalidError());
    }),
  );
}

/**
 * @see validate3rdFp
 */
export function validate3rd(
  value: Validate3rdValue,
  botId: number,
  options?: Validate3rdOptions,
): BetterPromise<void> {
  return BetterPromise.fn(async () => {
    await pipe(
      validate3rdFp(value, botId, options),
      TE.mapLeft(error => {
        throw error;
      }),
    )();
  });
}

/**
 * @param value - value to check.
 * @param botId - bot identifier
 * @param options - additional validation options.
 * @returns True is specified init data is signed by Telegram.
 */
export function isValid3rdFp(
  value: Validate3rdValue,
  botId: number,
  options?: Validate3rdOptions,
): TE.TaskEither<void, boolean> {
  return pipe(validate3rdFp(value, botId, options), TE.match(
    () => E.right(false),
    () => E.right(true),
  ));
}

/**
 * @see isValid3rdFp
 */
export function isValid3rd(
  value: Validate3rdValue,
  botId: number,
  options?: Validate3rdOptions,
): BetterPromise<boolean> {
  return BetterPromise.fn(() => pipe(
    isValid3rdFp(value, botId, options),
    TE.match(() => false, v => v),
  )());
}

export function validateFp<Left>(
  async: false,
  value: ValidateValue,
  token: Text,
  signData: ValidateSignDataFpArg<false, Left>,
  options?: ValidateOptions,
): E.Either<Left | ValidateError, void>;

export function validateFp<Left>(
  async: true,
  value: ValidateValue,
  token: Text,
  signData: ValidateSignDataFpArg<true, Left>,
  options?: ValidateAsyncOptions,
): TE.TaskEither<Left | ValidateAsyncError, void>;

export function validateFp<Left>(
  async: boolean,
  value: ValidateValue,
  token: Text,
  signData: ValidateSignDataFpArg<boolean, Left>,
  options: ValidateOptions | ValidateAsyncOptions = {},
):
  | E.Either<Left | ValidateError, void>
  | TE.TaskEither<Left | ValidateAsyncError, void> {
  // Init data required params.
  let authDate: Date | undefined;
  let authDateString: string | undefined;
  let hash: string | undefined;

  // All search params pairs presented as `k=v`.
  const pairs: string[] = [];

  // Iterate over all key-value pairs of parsed parameters and find required
  // parameters.
  (typeof value === 'string' ? new URLSearchParams(value) : value).forEach((value, key) => {
    if (key === 'hash') {
      hash = value;
      return;
    }

    if (key === 'auth_date') {
      authDateString = value;
      const authDateNum = parseInt(value, 10);
      if (!Number.isNaN(authDateNum)) {
        authDate = new Date(authDateNum * 1000);
      }
    }

    pairs.push(`${key}=${value}`);
  });

  // Hash and auth date always required.
  if (!hash) {
    return (async ? TE.left : E.left)(new SignatureMissingError(false));
  }

  if (!authDate) {
    return (async ? TE.left : E.left)(new AuthDateInvalidError(authDateString));
  }

  // In case, expiration time passed, we do additional parameters check.
  const { expiresIn = 86400 } = options;
  if (expiresIn > 0) {
    // Check if init data expired.
    const expiresAtTs = authDate.getTime() + (expiresIn * 1000);
    const nowTs = Date.now();
    if (expiresAtTs < nowTs) {
      return (async ? TE.left : E.left)(
        new ExpiredError(authDate, new Date(expiresAtTs), new Date(nowTs)),
      );
    }
  }

  // According to docs, we sort all the pairs in alphabetical order.
  pairs.sort();

  const eitherSignature = signData(pairs.join('\n'), token, options);
  const onLeft = (error: Left) => E.left(error);
  const onRight = (signature: string) => (
    signature === hash ? E.right(undefined) : E.left(new SignatureInvalidError())
  );

  return typeof eitherSignature === 'function'
    ? pipe(eitherSignature, TE.matchW(onLeft, onRight))
    : pipe(eitherSignature, E.matchW(onLeft, onRight));
}
