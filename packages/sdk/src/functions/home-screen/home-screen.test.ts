import { MethodUnsupportedError, TimeoutError } from '@tma.js/bridge';
import { describe, expect, it, vi } from 'vitest';

import { addToHomeScreen, checkHomeScreenStatus, safeCheckHomeScreenStatus } from './home-screen.js';
import { respond, setup } from '../../../test/utils.js';
import { NotInitializedError } from '../../errors.js';

describe('addToHomeScreen', () => {
  it('should call the method', () => {
    const calls = setup();
    addToHomeScreen();
    expect(calls).toHaveBeenCalledWith({ name: 'web_app_add_to_home_screen', params: undefined });
  });

  it('should throw MethodUnsupportedError before v8.0', () => {
    setup({ version: '7.10' });
    expect(() => addToHomeScreen()).toThrow(MethodUnsupportedError);
  });

  it('should throw NotInitializedError if the SDK is not initialized', () => {
    expect(() => addToHomeScreen()).toThrow(NotInitializedError);
  });
});

describe('checkHomeScreenStatus', () => {
  it.each(['added', 'missed', 'unsupported'])('should return the "%s" status', async status => {
    setup({ onMethod: respond('web_app_check_home_screen', 'home_screen_checked', { status }) });
    await expect(checkHomeScreenStatus()).resolves.toBe(status);
  });

  it('should return "unknown" if the status is missing', async () => {
    setup({ onMethod: respond('web_app_check_home_screen', 'home_screen_checked', {}) });
    await expect(checkHomeScreenStatus()).resolves.toBe('unknown');
  });

  it('should return TimeoutError if the Telegram client did not respond in time', async () => {
    vi.useFakeTimers();
    setup();
    const promise = safeCheckHomeScreenStatus({ timeout: 1000 });
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;
    expect(!result.ok && TimeoutError.is(result.error)).toBe(true);
    vi.useRealTimers();
  });

  it('should throw MethodUnsupportedError before v8.0', async () => {
    setup({ version: '7.10' });
    await expect(checkHomeScreenStatus()).rejects.toThrow(MethodUnsupportedError);
  });
});

describe('isSupported', () => {
  it.each([
    { name: 'addToHomeScreen', fn: addToHomeScreen, supported: '8.0', unsupported: '7.10' },
    { name: 'checkHomeScreenStatus', fn: checkHomeScreenStatus, supported: '8.0', unsupported: '7.10' },
    { name: 'safeCheckHomeScreenStatus', fn: safeCheckHomeScreenStatus, supported: '8.0', unsupported: '7.10' },
  ])('$name should check the Mini Apps version', ({ fn, supported, unsupported }) => {
    expect(fn.isSupported()).toBe(false);
    setup({ version: unsupported });
    expect(fn.isSupported()).toBe(false);
    setup({ version: supported });
    expect(fn.isSupported()).toBe(true);
  });
});
