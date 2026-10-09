import { StartParamTooLongError } from './errors.js';
import { err, ok, type Result, unwrap } from './result.js';

const MAX_LENGTH = 512;

/**
 * Encodes a string to base64url.
 * @param value - value to encode.
 * @see https://datatracker.ietf.org/doc/html/rfc4648#section-5
 */
export function encodeBase64Url(value: string): string {
  let binary = '';
  new TextEncoder().encode(value)
    .forEach(byte => {
      binary += String.fromCharCode(byte);
    });
  return btoa(binary).replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decodes a base64url string.
 * @param value - value to decode.
 * @throws {DOMException} The value is not a valid base64url string.
 * @throws {TypeError} The decoded value is not a valid UTF-8 string.
 */
export function decodeBase64Url(value: string): string {
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder('utf-8', { fatal: true }).decode(
    Uint8Array.from(binary, char => char.charCodeAt(0)),
  );
}

/**
 * @returns True if the value can be used to create a start parameter.
 * @param value - value to check.
 */
export function isSafeToCreateStartParam(value: string): boolean {
  return encodeBase64Url(value).length <= MAX_LENGTH;
}

/**
 * Creates a start parameter from the value. Non-string values are converted to JSON.
 * @param value - value to encode.
 * @returns Start parameter, or `StartParamTooLongError` if the encoded value exceeds 512
 * characters.
 * @see https://docs.telegram-mini-apps.com/platform/start-parameter
 */
export function safeCreateStartParam(value: unknown): Result<string, StartParamTooLongError> {
  const encoded = encodeBase64Url(typeof value === 'string' ? value : JSON.stringify(value));
  return encoded.length > MAX_LENGTH
    ? err(new StartParamTooLongError(encoded.length))
    : ok(encoded);
}

/**
 * Creates a start parameter from the value. Non-string values are converted to JSON.
 *
 * Throwing version of `safeCreateStartParam`.
 * @param value - value to encode.
 * @throws {StartParamTooLongError} The encoded value exceeds 512 characters.
 * @see https://docs.telegram-mini-apps.com/platform/start-parameter
 */
export function createStartParam(value: unknown): string {
  return unwrap(safeCreateStartParam(value));
}

/**
 * Decodes a start parameter created with `createStartParam`.
 * @param value - start parameter.
 * @param parse - `json` to parse the decoded value as JSON, or a custom parser.
 * @throws {DOMException} The value is not a valid base64url string.
 */
export function decodeStartParam(value: string): string;
export function decodeStartParam(value: string, parse: 'json'): unknown;
export function decodeStartParam<T>(value: string, parse: (value: string) => T): T;
export function decodeStartParam(
  value: string,
  parse?: 'json' | ((value: string) => unknown),
): unknown {
  const decoded = decodeBase64Url(value);
  if (!parse) {
    return decoded;
  }
  return parse === 'json' ? JSON.parse(decoded) : parse(decoded);
}
