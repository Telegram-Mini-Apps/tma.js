import { serialize } from './parsing.js';
import type { InitData } from './types.js';

/**
 * Bot token, or a secret key created with `createSecretKey`.
 */
export type Secret = string | CryptoKey;

/**
 * Init data to sign. If `auth_date` is omitted, the current date is used.
 */
export type SignableInitData = Omit<InitData, 'auth_date' | 'hash'> & { auth_date?: Date };

const encoder = new TextEncoder();

export function bytesToHex(bytes: ArrayBuffer): string {
  return Array
    .from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(hex.match(/../g) || [], byte => parseInt(byte, 16));
}

/**
 * @returns Data-check-string of the init data parameters: `key=value` pairs sorted
 * alphabetically and separated by line feeds.
 * @param pairs - init data parameters.
 */
export function createDataCheckString(pairs: [key: string, value: string][]): string {
  return pairs
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join('\n');
}

async function importHmacKey(raw: BufferSource): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function hmac(key: BufferSource, data: string): Promise<ArrayBuffer> {
  return crypto.subtle.sign('HMAC', await importHmacKey(key), encoder.encode(data));
}

/**
 * Hashes the bot token the way Telegram does to sign init data. Store the result instead of
 * the bot token if the server only needs to validate init data, and pass it to
 * `createSecretKey` with the `hashed` option.
 * @param token - bot token.
 * @returns HMAC-SHA-256 of the bot token keyed with `WebAppData`, in the hex format.
 */
export async function hashToken(token: string): Promise<string> {
  return bytesToHex(await hmac(encoder.encode('WebAppData'), token));
}

/**
 * Creates a key used to sign and validate init data. Create it once and reuse to avoid
 * hashing the bot token on each call.
 * @param token - bot token, or its hash created with `hashToken` if `hashed` is true.
 * @param options - additional options.
 * @throws {TypeError} The token is marked as hashed but isn't a SHA-256 hash in the hex format.
 */
export async function createSecretKey(
  token: string,
  options: { hashed?: boolean } = {},
): Promise<CryptoKey> {
  if (!options.hashed) {
    return importHmacKey(await hmac(encoder.encode('WebAppData'), token));
  }
  if (!/^[\da-f]{64}$/i.test(token)) {
    throw new TypeError('Hashed token must be a SHA-256 hash in the hex format');
  }
  return importHmacKey(hexToBytes(token));
}

export async function toSecretKey(secret: Secret): Promise<CryptoKey> {
  return typeof secret === 'string' ? createSecretKey(secret) : secret;
}

/**
 * Signs data the way Telegram signs init data.
 * @param data - data to sign, usually a data-check-string.
 * @param secret - bot token or a secret key.
 * @returns Signature in the hex format.
 */
export async function signData(data: string, secret: Secret): Promise<string> {
  const key = await toSecretKey(secret);
  return bytesToHex(await crypto.subtle.sign('HMAC', key, encoder.encode(data)));
}

/**
 * Signs init data. Useful to test the server or to mock the Telegram environment.
 * @param data - init data to sign.
 * @param secret - bot token or a secret key.
 * @returns Signed init data in the query format.
 * @example
 * const initData = await sign({ user: { id: 1, first_name: 'Pavel' } }, botToken);
 */
export async function sign(data: SignableInitData, secret: Secret): Promise<string> {
  const authDate = data.auth_date || new Date();
  const query = new URLSearchParams(serialize({ ...data, auth_date: authDate }));
  query.delete('hash');
  query.set('hash', await signData(createDataCheckString([...query]), secret));
  return query.toString();
}
