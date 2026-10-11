import { describe, expect, it, vi } from 'vitest';

import { parse } from './parsing.js';
import { createSecretKey, hashToken, sign, signData } from './signing.js';
import { validate } from './validation.js';
import { BOT_TOKEN, BOT_TOKEN_HASH } from '../test/fixtures.js';

describe('hashToken', () => {
  it('should compute HMAC-SHA-256 of the token keyed with "WebAppData"', async () => {
    await expect(hashToken('my-secret-token'))
      .resolves.toBe('fe37f490481d351837ed49f3b369c886c61013d6d036656fc3c9c92e163e3477');
    await expect(hashToken(BOT_TOKEN)).resolves.toBe(BOT_TOKEN_HASH);
  });
});

describe('signData', () => {
  const signature = '6ecc2e9b51f30dde6877ce374ede54eb626c84e78a5d9a9dcac54d2d248f6bde';

  it('should sign data with the bot token', async () => {
    await expect(signData('abc', 'my-secret-token')).resolves.toBe(signature);
  });

  it('should sign data with a secret key', async () => {
    await expect(signData('abc', await createSecretKey('my-secret-token')))
      .resolves.toBe(signature);
    const hashed = await createSecretKey(
      'fe37f490481d351837ed49f3b369c886c61013d6d036656fc3c9c92e163e3477',
      { hashed: true },
    );
    await expect(signData('abc', hashed)).resolves.toBe(signature);
  });
});

describe('createSecretKey', () => {
  it('should throw TypeError if the hashed token is not a SHA-256 hex string', async () => {
    await expect(createSecretKey('abc', { hashed: true })).rejects.toThrow(TypeError);
  });
});

describe('sign', () => {
  const data = {
    query_id: 'q',
    user: { id: 1, first_name: 'Pavel', is_premium: true },
    start_param: 'debug',
  };

  it('should create init data valid for the token', async () => {
    const signed = await sign({ ...data, auth_date: new Date(1000) }, BOT_TOKEN);
    await expect(validate(signed, BOT_TOKEN, { expiresIn: 0 })).resolves.toEqual({
      ...data,
      auth_date: new Date(1000),
      hash: new URLSearchParams(signed).get('hash'),
    });
  });

  it('should use the current date if auth_date is omitted', async () => {
    vi.useFakeTimers({ now: 5000, toFake: ['Date'] });
    try {
      expect(parse(await sign(data, BOT_TOKEN)).auth_date).toEqual(new Date(5000));
    } finally {
      vi.useRealTimers();
    }
  });

  it('should ignore the hash passed at runtime', async () => {
    const signed = await sign({ ...data, hash: 'fake' } as typeof data, BOT_TOKEN);
    expect(new URLSearchParams(signed).getAll('hash')).toHaveLength(1);
    await expect(validate(signed, BOT_TOKEN)).resolves.toBeDefined();
  });
});
