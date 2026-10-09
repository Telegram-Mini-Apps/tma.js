import { either as E, option as O } from 'fp-ts';
import { describe, expect, it, vi } from 'vitest';

import { Serverless, type ServerlessOptions } from '@/features/Serverless/Serverless.js';

const RAW_INIT_DATA = 'auth_date=1&hash=abc';

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status });
}

function instantiate({
  isTma = true,
  version = '9.6',
  retrieveRawInitData = () => E.right(O.some(RAW_INIT_DATA)),
  fetch = vi.fn(() => Promise.resolve(jsonResponse({ ok: true, result: 'r' }))),
}: Partial<ServerlessOptions> = {}) {
  return new Serverless({ isTma, version, retrieveRawInitData, fetch });
}

describe('call', () => {
  it('should return FunctionNotAvailableError outside Mini Apps', async () => {
    await expect(instantiate({ isTma: false }).callFp('a')()).resolves.toMatchObject({
      _tag: 'Left',
      left: { name: 'FunctionNotAvailableError' },
    });
  });

  it('should send POST request to /api/{name} with init data and input', async () => {
    const fetch = vi.fn(() => Promise.resolve(jsonResponse({ ok: true, result: 1 })));
    await instantiate({ fetch }).callFp('getProfile', { lang: 'en' })();
    expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/getProfile', {
      method: 'POST',
      headers: {
        Authorization: `TMA ${btoa(RAW_INIT_DATA)}`,
        'Content-Type': 'application/json',
      },
      body: '{"lang":"en"}',
      credentials: 'omit',
      signal: undefined,
    });
  });

  it('should send empty object if input is omitted', async () => {
    const fetch = vi.fn(() => Promise.resolve(jsonResponse({ ok: true })));
    await instantiate({ fetch }).callFp('a')();
    expect(fetch.mock.calls[0]).toMatchObject([expect.anything(), { body: '{}' }]);
  });

  it('should resolve with the endpoint result', async () => {
    const fetch = () => Promise.resolve(jsonResponse({ ok: true, result: { id: 1 } }));
    await expect(instantiate({ fetch }).callFp('a')()).resolves.toStrictEqual(E.right({ id: 1 }));
    await expect(instantiate({ fetch }).call('a')).resolves.toStrictEqual({ id: 1 });
  });

  it('should return InvalidArgumentsError if input is not an object', async () => {
    await expect(instantiate().callFp('a', [])()).resolves.toMatchObject({
      _tag: 'Left',
      left: { name: 'InvalidArgumentsError' },
    });
  });

  it('should return InvalidEnvError if init data is missing', async () => {
    const fetch = vi.fn();
    await expect(
      instantiate({ fetch, retrieveRawInitData: () => E.right(O.none) }).callFp('a')(),
    ).resolves.toMatchObject({ _tag: 'Left', left: { name: 'InvalidEnvError' } });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should return ServerlessError with endpoint error data', async () => {
    const fetch = () => Promise.resolve(jsonResponse({
      ok: false,
      description: 'Not allowed',
      error_code: 403,
      error_type: 'ENDPOINT_ERROR',
      parameters: { reason: 'x' },
    }, 400));
    await expect(instantiate({ fetch }).callFp('a')()).resolves.toMatchObject({
      _tag: 'Left',
      left: {
        name: 'ServerlessError',
        message: 'Not allowed',
        data: { status: 403, type: 'ENDPOINT_ERROR', parameters: { reason: 'x' } },
      },
    });
  });

  it('should return ServerlessError with HTTP status if response is unexpected', async () => {
    const fetch = () => Promise.resolve(new Response('oops', { status: 502 }));
    await expect(instantiate({ fetch }).callFp('a')()).resolves.toMatchObject({
      _tag: 'Left',
      left: {
        name: 'ServerlessError',
        message: 'Unexpected response from endpoint a (HTTP 502)',
        data: { status: 502 },
      },
    });
  });

  it('should return ServerlessError with status 0 on network error', async () => {
    const fetch = () => Promise.reject(new Error('offline'));
    await expect(instantiate({ fetch }).callFp('a')()).resolves.toMatchObject({
      _tag: 'Left',
      left: {
        name: 'ServerlessError',
        message: 'Network error calling endpoint a: offline',
        data: { status: 0 },
      },
    });
  });
});
