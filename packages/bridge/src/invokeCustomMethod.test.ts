import { describe, expect, it, vi } from 'vitest';

import { InvokeCustomMethodFailedError, TimeoutError } from './errors.js';
import { emitEvent } from './events.js';
import { invokeCustomMethod, safeInvokeCustomMethod } from './invokeCustomMethod.js';

function mockProxy(respond: (reqId: string) => void) {
  const postEvent = vi.fn((_: string, data: string) => {
    respond((JSON.parse(data) as { req_id: string }).req_id);
  });
  (window as any).TelegramWebviewProxy = { postEvent };
  return postEvent;
}

describe('invokeCustomMethod', () => {
  it('should call the method and resolve with the result', async () => {
    const postEvent = mockProxy(req_id => {
      emitEvent('custom_method_invoked', { req_id: 'other', result: 'other' });
      emitEvent('custom_method_invoked', { req_id, result: 'value' });
    });
    await expect(invokeCustomMethod('getStorageKeys', {}, { requestId: 'abc' }))
      .resolves
      .toBe('value');
    expect(postEvent).toHaveBeenCalledWith(
      'web_app_invoke_custom_method',
      '{"method":"getStorageKeys","params":{},"req_id":"abc"}',
    );
  });

  it('should generate the request identifier', async () => {
    mockProxy(req_id => emitEvent('custom_method_invoked', { req_id, result: 1 }));
    await expect(invokeCustomMethod('getCurrentTime', {})).resolves.toBe(1);
  });

  it('should reject with InvokeCustomMethodFailedError', async () => {
    mockProxy(req_id => emitEvent('custom_method_invoked', { req_id, error: 'ERR' }));
    await expect(invokeCustomMethod('getCurrentTime', {}))
      .rejects
      .toSatisfy(e => InvokeCustomMethodFailedError.is(e));
  });
});

describe('safeInvokeCustomMethod', () => {
  it('should resolve with the result', async () => {
    mockProxy(req_id => emitEvent('custom_method_invoked', { req_id, result: 1 }));
    await expect(safeInvokeCustomMethod('getCurrentTime', {}))
      .resolves
      .toEqual({ ok: true, data: 1 });
  });

  it('should resolve with InvokeCustomMethodFailedError', async () => {
    mockProxy(req_id => emitEvent('custom_method_invoked', { req_id, error: 'ERR' }));
    await expect(safeInvokeCustomMethod('getCurrentTime', {}))
      .resolves
      .toEqual({ ok: false, error: new InvokeCustomMethodFailedError('ERR') });
  });

  it('should resolve with TimeoutError', async () => {
    vi.useFakeTimers();
    mockProxy(() => undefined);
    const promise = safeInvokeCustomMethod('getCurrentTime', {}, { timeout: 100 });
    vi.advanceTimersByTime(100);
    await expect(promise).resolves.toEqual({ ok: false, error: new TimeoutError(100) });
    vi.useRealTimers();
  });
});
