import { describe, expect, it, vi } from 'vitest';

import { serverless } from './serverless.js';
import { setup } from '../../../test/utils.js';
import { InvalidArgumentsError, InvalidEnvError, ServerlessError } from '../../errors.js';

function mockFetch(body: unknown, status = 200) {
  const fetch = vi.fn(async () => new Response(
    typeof body === 'string' ? body : JSON.stringify(body),
    { status },
  ));
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

describe('serverless', () => {
  it('should call the endpoint passing init data', async () => {
    setup({ launchParams: { tgWebAppData: 'query' } });
    const fetch = mockFetch({ ok: true, result: { a: 1 } });
    await expect(serverless.call('getData', { b: 2 })).resolves.toEqual({ a: 1 });
    expect(fetch).toHaveBeenCalledWith('/api/getData', expect.objectContaining({
      body: '{"b":2}',
      headers: { Authorization: `TMA ${btoa('query')}`, 'Content-Type': 'application/json' },
      method: 'POST',
    }));
  });

  it('should return ServerlessError if the endpoint failed', async () => {
    setup({ launchParams: { tgWebAppData: 'query' } });
    mockFetch({ description: 'Oops', error_code: 400, error_type: 'ENDPOINT_ERROR', ok: false });
    const result = await serverless.safeCall('getData');
    const error = !result.ok && ServerlessError.is(result.error) && result.error;
    expect(error && [error.message, error.data])
      .toEqual(['Oops', { parameters: undefined, status: 400, type: 'ENDPOINT_ERROR' }]);
  });

  it('should return ServerlessError for unexpected responses and network errors', async () => {
    setup({ launchParams: { tgWebAppData: 'query' } });
    mockFetch('not json', 500);
    let result = await serverless.safeCall('getData');
    expect(!result.ok && ServerlessError.is(result.error) && result.error.data.status).toBe(500);

    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));
    result = await serverless.safeCall('getData');
    expect(!result.ok && ServerlessError.is(result.error) && result.error.data.status).toBe(0);
  });

  it('should reject with the abort reason', async () => {
    setup({ launchParams: { tgWebAppData: 'query' } });
    const controller = new AbortController();
    const reason = new Error('aborted');
    controller.abort(reason);
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(reason)));
    await expect(serverless.call('getData', {}, { signal: controller.signal })).rejects.toBe(reason);
  });

  it('should return InvalidArgumentsError for non-object input', async () => {
    setup({ launchParams: { tgWebAppData: 'query' } });
    const result = await serverless.safeCall('getData', [] as object);
    expect(!result.ok && InvalidArgumentsError.is(result.error)).toBe(true);
  });

  it('should reject with InvalidEnvError if init data is missing', async () => {
    setup();
    await expect(serverless.call('getData')).rejects.toThrow(InvalidEnvError);
  });
});
