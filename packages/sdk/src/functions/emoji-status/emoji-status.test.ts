import { MethodUnsupportedError, TimeoutError } from '@tma.js/bridge';
import { describe, expect, it, vi } from 'vitest';

import {
  requestEmojiStatusAccess,
  safeRequestEmojiStatusAccess,
  safeSetEmojiStatus,
  setEmojiStatus,
} from './emoji-status.js';
import { respond, setup } from '../../../test/utils.js';
import { SetEmojiStatusError } from '../../errors.js';

describe('requestEmojiStatusAccess', () => {
  it.each(['allowed', 'cancelled'])('should return the "%s" status', async status => {
    const calls = setup({
      onMethod: respond(
        'web_app_request_emoji_status_access',
        'emoji_status_access_requested',
        { status },
      ),
    });
    await expect(requestEmojiStatusAccess()).resolves.toBe(status);
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_request_emoji_status_access',
      params: undefined,
    });
  });

  it('should return TimeoutError if the user did not respond in time', async () => {
    vi.useFakeTimers();
    setup();
    const promise = safeRequestEmojiStatusAccess({ timeout: 1000 });
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;
    expect(!result.ok && TimeoutError.is(result.error)).toBe(true);
    vi.useRealTimers();
  });

  it('should throw MethodUnsupportedError before v8.0', async () => {
    setup({ version: '7.10' });
    await expect(requestEmojiStatusAccess()).rejects.toThrow(MethodUnsupportedError);
  });
});

describe('setEmojiStatus', () => {
  it('should set the emoji status', async () => {
    const calls = setup({ onMethod: respond('web_app_set_emoji_status', 'emoji_status_set') });
    await expect(setEmojiStatus('id', { duration: 3600 })).resolves.toBeUndefined();
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_set_emoji_status',
      params: { custom_emoji_id: 'id', duration: 3600 },
    });
  });

  it('should return SetEmojiStatusError if the status was not set', async () => {
    setup({
      onMethod: respond('web_app_set_emoji_status', 'emoji_status_failed', {
        error: 'USER_DECLINED',
      }),
    });
    const result = await safeSetEmojiStatus('id');
    expect(!result.ok && SetEmojiStatusError.is(result.error)).toBe(true);
    expect(!result.ok && result.error.message).toBe('Failed to set emoji status: USER_DECLINED');
    await expect(setEmojiStatus('id')).rejects.toThrow(SetEmojiStatusError);
  });

  it('should return TimeoutError if the user did not respond in time', async () => {
    vi.useFakeTimers();
    setup();
    const promise = safeSetEmojiStatus('id', { timeout: 1000 });
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;
    expect(!result.ok && TimeoutError.is(result.error)).toBe(true);
    vi.useRealTimers();
  });

  it('should throw MethodUnsupportedError before v8.0', async () => {
    setup({ version: '7.10' });
    await expect(setEmojiStatus('id')).rejects.toThrow(MethodUnsupportedError);
  });
});

describe('isSupported', () => {
  it.each([
    { fn: requestEmojiStatusAccess, name: 'requestEmojiStatusAccess', supported: '8.0', unsupported: '7.10' },
    { fn: safeRequestEmojiStatusAccess, name: 'safeRequestEmojiStatusAccess', supported: '8.0', unsupported: '7.10' },
    { fn: setEmojiStatus, name: 'setEmojiStatus', supported: '8.0', unsupported: '7.10' },
    { fn: safeSetEmojiStatus, name: 'safeSetEmojiStatus', supported: '8.0', unsupported: '7.10' },
  ])('$name should check the Mini Apps version', ({ fn, supported, unsupported }) => {
    expect(fn.isSupported()).toBe(false);
    setup({ version: unsupported });
    expect(fn.isSupported()).toBe(false);
    setup({ version: supported });
    expect(fn.isSupported()).toBe(true);
  });
});
