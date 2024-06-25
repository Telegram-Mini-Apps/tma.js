import { InitData, InitDataParsed } from '@telegram-apps/sdk';

import { sign as baseSign } from '../sign.js';
import { signData as baseSignData } from '../signData.js';
import { validate as baseValidate } from '../validate.js';
import type{ ValidateOptions } from '../validate.js';
import type { SignData } from '../types.js';

/**
 * Signs specified init data.
 * @param data - init data to sign.
 * @param authDate - date, when this init data should be signed.
 * @param key - private key.
 * @returns Signed init data presented as query parameters.
 */
export function sign(data: SignData, key: string, authDate: Date): Promise<string> {
  return baseSign(data, key, authDate, signData);
}

/**
 * Signs specified data with the passed token.
 * @param data - data to sign.
 * @param key - private key.
 * @returns Data sign.
 */
export async function signData(data: string, key: string): Promise<string> {
  return baseSignData(data, key, async (d, k) => {
    const encoder = new TextEncoder();

    return Buffer.from(
      await crypto.subtle.sign(
        'HMAC',
        await crypto.subtle.importKey(
          'raw',
          typeof k === 'string' ? encoder.encode(k) : k,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign', 'verify'],
        ),
        encoder.encode(d),
      ),
    );
  });
}

/**
 * Validates passed init data.
 * @param value - value to check.
 * @param token - bot secret token.
 * @param options - additional validation options.
 * @throws {TypeError} "auth_date" should present integer
 * @throws {Error} "hash" is empty or not found
 * @throws {Error} "auth_date" is empty or not found
 * @throws {Error} Init data expired
 */
export async function validate(
  value: InitData | InitDataParsed | string | URLSearchParams,
  token: string,
  options?: ValidateOptions,
): Promise<void> {
  return baseValidate(value, token, signData, options);
}

export * from './shared.js';
