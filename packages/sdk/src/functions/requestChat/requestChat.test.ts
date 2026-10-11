import { MethodUnsupportedError, TimeoutError } from '@tma.js/bridge';
import { describe, expect, it, vi } from 'vitest';

import { requestChat, safeRequestChat } from './requestChat.js';
import { respond, setup } from '../../../test/utils.js';
import { RequestChatError } from '../../errors.js';

describe('requestChat', () => {
  it('should resolve if the chat was shared', async () => {
    const calls = setup({ onMethod: respond('web_app_request_chat', 'requested_chat_sent', {}) });
    await expect(requestChat('id')).resolves.toBeUndefined();
    expect(calls).toHaveBeenCalledWith({ name: 'web_app_request_chat', params: { req_id: 'id' } });
  });

  it('should return RequestChatError if the chat was not shared', async () => {
    setup({ onMethod: respond('web_app_request_chat', 'requested_chat_failed', { error: 'A' }) });
    const result = await safeRequestChat('id');
    expect(!result.ok && RequestChatError.is(result.error)).toBe(true);
    await expect(requestChat('id')).rejects.toThrow(RequestChatError);
  });

  it('should return TimeoutError if the user did not respond in time', async () => {
    vi.useFakeTimers();
    setup();
    const promise = safeRequestChat('id', { timeout: 1000 });
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;
    expect(!result.ok && TimeoutError.is(result.error)).toBe(true);
    vi.useRealTimers();
  });

  it('should throw MethodUnsupportedError before v9.6', async () => {
    setup({ version: '9.5' });
    await expect(requestChat('id')).rejects.toThrow(MethodUnsupportedError);
  });
});

describe('isSupported', () => {
  it.each([
    { name: 'requestChat', fn: requestChat },
    { name: 'safeRequestChat', fn: safeRequestChat },
  ])('$name should check the Mini Apps version', ({ fn }) => {
    expect(fn.isSupported()).toBe(false);
    setup({ version: '9.5' });
    expect(fn.isSupported()).toBe(false);
    setup({ version: '9.6' });
    expect(fn.isSupported()).toBe(true);
  });
});
