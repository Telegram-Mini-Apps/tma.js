import { describe, expect, it, vi } from 'vitest';

import {
  AuthDateInvalidError,
  ExpiredError,
  InvalidInitDataError,
  SignatureInvalidError,
  SignatureMissingError,
} from './errors.js';
import { parse, safeParse } from './parsing.js';
import { createSecretKey, sign } from './signing.js';
import {
  isValid,
  isValid3rd,
  safeValidate,
  safeValidate3rd,
  validate,
  validate3rd,
} from './validation.js';
import { AUTH_DATE, BOT_ID, BOT_TOKEN, BOT_TOKEN_HASH, INIT_DATA } from '../test/fixtures.js';

const NO_EXPIRATION = { expiresIn: 0 };

function withParam(key: string, value: string): string {
  const query = new URLSearchParams(INIT_DATA);
  query.set(key, value);
  return query.toString();
}

describe('validate', () => {
  it('should return parsed init data if it is valid', async () => {
    await expect(validate(INIT_DATA, BOT_TOKEN, NO_EXPIRATION)).resolves.toEqual(parse(INIT_DATA));
    await expect(validate(new URLSearchParams(INIT_DATA), BOT_TOKEN, NO_EXPIRATION))
      .resolves.toEqual(parse(INIT_DATA));
  });

  it('should accept secret keys', async () => {
    const key = await createSecretKey(BOT_TOKEN);
    const hashedKey = await createSecretKey(BOT_TOKEN_HASH, { hashed: true });
    await expect(validate(INIT_DATA, key, NO_EXPIRATION)).resolves.toBeDefined();
    await expect(validate(INIT_DATA, hashedKey, NO_EXPIRATION)).resolves.toBeDefined();
  });

  it('should throw SignatureMissingError if "hash" is missing', async () => {
    await expect(validate('auth_date=1', BOT_TOKEN)).rejects.toThrow(
      new SignatureMissingError('hash'),
    );
  });

  it.each([
    ['missing', 'hash=h', undefined],
    ['not an integer', 'auth_date=1a&hash=h', '1a'],
  ])('should throw AuthDateInvalidError if "auth_date" is %s', async (_, value, authDate) => {
    await expect(validate(value, BOT_TOKEN)).rejects.toThrow(new AuthDateInvalidError(authDate));
  });

  it('should throw ExpiredError if init data has expired', async () => {
    vi.useFakeTimers({ now: AUTH_DATE + 11000, toFake: ['Date'] });
    try {
      const error = await validate(INIT_DATA, BOT_TOKEN, { expiresIn: 10 }).catch(e => e);
      expect(error).toBeInstanceOf(ExpiredError);
      expect((error as ExpiredError).data).toEqual({
        issuedAt: new Date(AUTH_DATE),
        expiresAt: new Date(AUTH_DATE + 10000),
        now: new Date(AUTH_DATE + 11000),
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it('should expire init data in 1 day by default', async () => {
    vi.useFakeTimers({ now: AUTH_DATE + 86400000 + 1, toFake: ['Date'] });
    try {
      await expect(validate(INIT_DATA, BOT_TOKEN)).rejects.toThrow(ExpiredError);
    } finally {
      vi.useRealTimers();
    }
  });

  it.each([
    ['the token is wrong', INIT_DATA, `${BOT_TOKEN}A`],
    ['the data is changed', withParam('chat_type', 'group'), BOT_TOKEN],
    ['the hash is not hex', withParam('hash', 'zz'), BOT_TOKEN],
  ])('should throw SignatureInvalidError if %s', async (_, value, token) => {
    await expect(validate(value, token, NO_EXPIRATION)).rejects.toThrow(SignatureInvalidError);
  });

  it('should throw InvalidInitDataError if signed init data has an unexpected structure', async () => {
    const signed = await sign({ auth_date: new Date(), user: '1' as never }, BOT_TOKEN);
    await expect(validate(signed, BOT_TOKEN)).rejects.toThrow(InvalidInitDataError);
  });
});

describe('safeValidate', () => {
  it('should return parsed init data if it is valid', async () => {
    await expect(safeValidate(INIT_DATA, BOT_TOKEN, NO_EXPIRATION))
      .resolves.toEqual({ ok: true, data: parse(INIT_DATA) });
  });

  it('should return the error instead of throwing it', async () => {
    await expect(safeValidate('auth_date=1', BOT_TOKEN)).resolves.toEqual({
      ok: false,
      error: new SignatureMissingError('hash'),
    });
    await expect(safeValidate(INIT_DATA, `${BOT_TOKEN}A`, NO_EXPIRATION)).resolves.toEqual({
      ok: false,
      error: new SignatureInvalidError(),
    });
  });

  it('should return InvalidInitDataError if signed init data has an unexpected structure', async () => {
    const signed = await sign({ auth_date: new Date(), user: '1' as never }, BOT_TOKEN);
    const result = await safeValidate(signed, BOT_TOKEN);
    expect(!result.ok && InvalidInitDataError.is(result.error)).toBe(true);
    expect(result).toEqual(safeParse(signed));
  });

  it('should throw unexpected errors', async () => {
    const error = new Error('Crypto is broken');
    vi.spyOn(crypto.subtle, 'verify').mockRejectedValue(error);
    await expect(safeValidate(INIT_DATA, BOT_TOKEN, NO_EXPIRATION)).rejects.toBe(error);
  });
});

describe('isValid', () => {
  it('should return true if init data is valid', async () => {
    await expect(isValid(INIT_DATA, BOT_TOKEN, NO_EXPIRATION)).resolves.toBe(true);
  });

  it.each([
    ['"hash" is missing', 'auth_date=1'],
    ['"auth_date" is invalid', 'hash=h'],
    ['init data has expired', INIT_DATA],
  ])('should return false if %s', async (_, value) => {
    await expect(isValid(value, BOT_TOKEN)).resolves.toBe(false);
  });

  it('should return false if the signature is invalid', async () => {
    await expect(isValid(INIT_DATA, `${BOT_TOKEN}A`, NO_EXPIRATION)).resolves.toBe(false);
  });

  it('should rethrow unexpected errors', async () => {
    const error = new Error('Crypto is broken');
    vi.spyOn(crypto.subtle, 'verify').mockRejectedValue(error);
    await expect(isValid(INIT_DATA, BOT_TOKEN, NO_EXPIRATION)).rejects.toBe(error);
  });
});

describe('validate3rd', () => {
  it('should return parsed init data if it is valid', async () => {
    await expect(validate3rd(INIT_DATA, BOT_ID, NO_EXPIRATION)).resolves.toEqual(parse(INIT_DATA));
  });

  it('should throw SignatureMissingError if "signature" is missing', async () => {
    await expect(validate3rd('auth_date=1&hash=h', BOT_ID)).rejects.toThrow(
      new SignatureMissingError('signature'),
    );
  });

  it('should throw AuthDateInvalidError if "auth_date" is invalid', async () => {
    await expect(validate3rd('signature=s&auth_date=a', BOT_ID)).rejects.toThrow(
      new AuthDateInvalidError('a'),
    );
  });

  it('should throw ExpiredError if init data has expired', async () => {
    await expect(validate3rd(INIT_DATA, BOT_ID)).rejects.toThrow(ExpiredError);
  });

  it.each([
    ['the bot identifier is wrong', INIT_DATA, BOT_ID + 1, {}],
    ['the test environment key is used', INIT_DATA, BOT_ID, { test: true }],
    ['the data is changed', withParam('chat_type', 'group'), BOT_ID, {}],
    ['the signature is not base64url', withParam('signature', '!'), BOT_ID, {}],
  ])('should throw SignatureInvalidError if %s', async (_, value, botId, options) => {
    await expect(validate3rd(value, botId, { ...NO_EXPIRATION, ...options }))
      .rejects.toThrow(SignatureInvalidError);
  });

  it('should ignore "hash" in the data-check-string', async () => {
    await expect(validate3rd(withParam('hash', 'other'), BOT_ID, NO_EXPIRATION))
      .resolves.toBeDefined();
  });
});

describe('safeValidate3rd', () => {
  it('should return parsed init data if it is valid', async () => {
    await expect(safeValidate3rd(INIT_DATA, BOT_ID, NO_EXPIRATION))
      .resolves.toEqual({ ok: true, data: parse(INIT_DATA) });
  });

  it('should return the error instead of throwing it', async () => {
    await expect(safeValidate3rd(INIT_DATA, BOT_ID + 1, NO_EXPIRATION)).resolves.toEqual({
      ok: false,
      error: new SignatureInvalidError(),
    });
    await expect(safeValidate3rd('auth_date=1', BOT_ID)).resolves.toEqual({
      ok: false,
      error: new SignatureMissingError('signature'),
    });
  });
});

describe('isValid3rd', () => {
  it('should return true if init data is valid', async () => {
    await expect(isValid3rd(INIT_DATA, BOT_ID, NO_EXPIRATION)).resolves.toBe(true);
  });

  it('should return false if init data is invalid', async () => {
    await expect(isValid3rd(INIT_DATA, BOT_ID + 1, NO_EXPIRATION)).resolves.toBe(false);
    await expect(isValid3rd('auth_date=1', BOT_ID)).resolves.toBe(false);
  });

  it('should rethrow unexpected errors', async () => {
    const error = new Error('Crypto is broken');
    vi.spyOn(crypto.subtle, 'verify').mockRejectedValue(error);
    await expect(isValid3rd(INIT_DATA, BOT_ID, NO_EXPIRATION)).rejects.toBe(error);
  });
});
