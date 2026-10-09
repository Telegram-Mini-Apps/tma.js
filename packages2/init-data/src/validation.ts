import {
  AuthDateInvalidError,
  ExpiredError,
  SignatureInvalidError,
  type InvalidInitDataError,
  SignatureMissingError,
} from './errors.js';
import { safeParse } from './parsing.js';
import { err, ok, type Result, unwrap } from './result.js';
import { createDataCheckString, hexToBytes, type Secret, toSecretKey } from './signing.js';
import type { InitData } from './types.js';

const PUBLIC_KEYS = {
  production: 'e7bf03a2fa4602af4580703d88dda5bb59f32ed8b02a56c187fe7d34caed242d',
  test: '40055058a4ee38156a06562e52eece92a771bcd8346a8c4615cb7376eddf72ec',
};

export interface ValidateOptions {
  /**
   * Time in seconds during which init data is considered valid after it was created. Pass `0`
   * to skip the expiration check.
   * @default 86400 (1 day)
   */
  expiresIn?: number;
}

export interface Validate3rdOptions extends ValidateOptions {
  /**
   * True if init data was created in the Telegram test environment.
   * @default false
   */
  test?: boolean;
}

/**
 * Error returned when init data is invalid.
 */
export type ValidateError =
  | SignatureMissingError
  | AuthDateInvalidError
  | ExpiredError
  | SignatureInvalidError
  | InvalidInitDataError;

type VerifyError = Exclude<ValidateError, InvalidInitDataError>;

/**
 * Extracts the signature and data-check-string from init data, and checks its expiration.
 * @param value - init data query.
 * @param param - parameter containing the signature.
 * @param exclude - parameters excluded from the data-check-string.
 * @param options - validation options.
 */
function prepare(
  value: string | URLSearchParams,
  param: 'hash' | 'signature',
  exclude: string[],
  { expiresIn = 86400 }: ValidateOptions,
): Result<
  { signature: string; dataCheckString: string },
  SignatureMissingError | AuthDateInvalidError | ExpiredError
> {
  const query = new URLSearchParams(value);
  const signature = query.get(param);
  if (!signature) {
    return err(new SignatureMissingError(param));
  }

  const authDateRaw = query.get('auth_date') ?? undefined;
  if (!authDateRaw || !/^\d+$/.test(authDateRaw)) {
    return err(new AuthDateInvalidError(authDateRaw));
  }

  if (expiresIn > 0) {
    const authDate = new Date(Number(authDateRaw) * 1000);
    const expiresAt = new Date(authDate.getTime() + (expiresIn * 1000));
    const now = new Date();
    if (expiresAt < now) {
      return err(new ExpiredError(authDate, expiresAt, now));
    }
  }

  return ok({
    signature,
    dataCheckString: createDataCheckString([...query].filter(([key]) => !exclude.includes(key))),
  });
}

async function verify(
  value: string | URLSearchParams,
  secret: Secret,
  options: ValidateOptions = {},
): Promise<Result<void, VerifyError>> {
  const prepared = prepare(value, 'hash', ['hash'], options);
  if (!prepared.ok) {
    return prepared;
  }
  const { signature, dataCheckString } = prepared.data;
  // crypto.subtle.verify compares signatures in constant time, which protects from timing
  // attacks.
  const verified = /^[\da-f]{64}$/i.test(signature) && await crypto.subtle.verify(
    'HMAC',
    await toSecretKey(secret),
    hexToBytes(signature),
    new TextEncoder().encode(dataCheckString),
  );
  return verified ? ok(undefined) : err(new SignatureInvalidError());
}

async function verify3rd(
  value: string | URLSearchParams,
  botId: number,
  options: Validate3rdOptions = {},
): Promise<Result<void, VerifyError>> {
  const prepared = prepare(value, 'signature', ['hash', 'signature'], options);
  if (!prepared.ok) {
    return prepared;
  }
  const { signature, dataCheckString } = prepared.data;

  let signatureBytes: Uint8Array<ArrayBuffer>;
  try {
    // The signature is in the base64url format.
    const binary = atob(signature.replace(/-/g, '+').replace(/_/g, '/'));
    signatureBytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  } catch {
    return err(new SignatureInvalidError());
  }

  const verified = await crypto.subtle.verify(
    'Ed25519',
    await crypto.subtle.importKey(
      'raw',
      hexToBytes(PUBLIC_KEYS[options.test ? 'test' : 'production']),
      'Ed25519',
      false,
      ['verify'],
    ),
    signatureBytes,
    new TextEncoder().encode(`${botId}:WebAppData\n${dataCheckString}`),
  );
  return verified ? ok(undefined) : err(new SignatureInvalidError());
}

/**
 * Validates init data using the bot token and parses it.
 * @param value - init data query.
 * @param secret - bot token or a secret key created with `createSecretKey`.
 * @param options - additional options.
 * @returns Parsed init data, or one of the errors:
 * - `SignatureMissingError`: the `hash` parameter is missing;
 * - `AuthDateInvalidError`: the `auth_date` parameter is missing or invalid;
 * - `ExpiredError`: init data has expired;
 * - `SignatureInvalidError`: init data wasn't signed with the specified bot token;
 * - `InvalidInitDataError`: init data is signed, but has an unexpected structure.
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * @example
 * const result = await safeValidate(rawInitData, botToken);
 * if (!result.ok) {
 *   return matchError(result.error, {
 *     ExpiredError: () => reply(401, 'Init data has expired'),
 *     ...
 *   });
 * }
 * const initData = result.data;
 */
export async function safeValidate(
  value: string | URLSearchParams,
  secret: Secret,
  options?: ValidateOptions,
): Promise<Result<InitData, ValidateError>> {
  const verified = await verify(value, secret, options);
  return verified.ok ? safeParse(value) : verified;
}

/**
 * Validates init data using the bot token and parses it.
 *
 * Throwing version of `safeValidate`.
 * @param value - init data query.
 * @param secret - bot token or a secret key created with `createSecretKey`.
 * @param options - additional options.
 * @returns Parsed init data.
 * @throws {SignatureMissingError} The `hash` parameter is missing.
 * @throws {AuthDateInvalidError} The `auth_date` parameter is missing or invalid.
 * @throws {ExpiredError} Init data has expired.
 * @throws {SignatureInvalidError} Init data wasn't signed with the specified bot token.
 * @throws {InvalidInitDataError} Init data is signed, but has an unexpected structure.
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * @example
 * const initData = await validate(rawInitData, botToken);
 */
export async function validate(
  value: string | URLSearchParams,
  secret: Secret,
  options?: ValidateOptions,
): Promise<InitData> {
  return unwrap(await safeValidate(value, secret, options));
}

/**
 * @returns True if init data is signed with the bot token and hasn't expired.
 * @param value - init data query.
 * @param secret - bot token or a secret key created with `createSecretKey`.
 * @param options - additional options.
 */
export async function isValid(
  value: string | URLSearchParams,
  secret: Secret,
  options?: ValidateOptions,
): Promise<boolean> {
  return (await verify(value, secret, options)).ok;
}

/**
 * Validates init data without the bot token, using the Telegram public key, and parses it.
 * Useful for third parties receiving init data of another bot.
 * @param value - init data query.
 * @param botId - identifier of the bot the init data was issued for.
 * @param options - additional options.
 * @returns Parsed init data, or one of the errors:
 * - `SignatureMissingError`: the `signature` parameter is missing;
 * - `AuthDateInvalidError`: the `auth_date` parameter is missing or invalid;
 * - `ExpiredError`: init data has expired;
 * - `SignatureInvalidError`: init data wasn't signed by Telegram for the specified bot;
 * - `InvalidInitDataError`: init data is signed, but has an unexpected structure.
 * @see https://core.telegram.org/bots/webapps#validating-data-for-third-party-use
 */
export async function safeValidate3rd(
  value: string | URLSearchParams,
  botId: number,
  options?: Validate3rdOptions,
): Promise<Result<InitData, ValidateError>> {
  const verified = await verify3rd(value, botId, options);
  return verified.ok ? safeParse(value) : verified;
}

/**
 * Validates init data without the bot token, using the Telegram public key, and parses it.
 * Useful for third parties receiving init data of another bot.
 *
 * Throwing version of `safeValidate3rd`.
 * @param value - init data query.
 * @param botId - identifier of the bot the init data was issued for.
 * @param options - additional options.
 * @returns Parsed init data.
 * @throws {SignatureMissingError} The `signature` parameter is missing.
 * @throws {AuthDateInvalidError} The `auth_date` parameter is missing or invalid.
 * @throws {ExpiredError} Init data has expired.
 * @throws {SignatureInvalidError} Init data wasn't signed by Telegram for the specified bot.
 * @throws {InvalidInitDataError} Init data is signed, but has an unexpected structure.
 * @see https://core.telegram.org/bots/webapps#validating-data-for-third-party-use
 */
export async function validate3rd(
  value: string | URLSearchParams,
  botId: number,
  options?: Validate3rdOptions,
): Promise<InitData> {
  return unwrap(await safeValidate3rd(value, botId, options));
}

/**
 * @returns True if init data is signed by Telegram for the specified bot and hasn't expired.
 * @param value - init data query.
 * @param botId - identifier of the bot the init data was issued for.
 * @param options - additional options.
 */
export async function isValid3rd(
  value: string | URLSearchParams,
  botId: number,
  options?: Validate3rdOptions,
): Promise<boolean> {
  return (await verify3rd(value, botId, options)).ok;
}
