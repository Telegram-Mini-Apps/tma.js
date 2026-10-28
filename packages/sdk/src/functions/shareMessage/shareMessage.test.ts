import { TimeoutError } from '@tma.js/bridge';
import { describe, expect, it, vi } from 'vitest';

import { safeShareMessage, shareMessage } from './shareMessage.js';
import { respond, setup } from '../../../test/utils.js';
import { ShareMessageError } from '../../errors.js';

describe('shareMessage', () => {
  it('should resolve if the message was shared', async () => {
    const calls = setup({
      onMethod: respond('web_app_send_prepared_message', 'prepared_message_sent'),
    });
    await expect(shareMessage('id')).resolves.toBeUndefined();
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_send_prepared_message',
      params: { id: 'id' },
    });
  });

  it('should return ShareMessageError if the message was not shared', async () => {
    setup({
      onMethod: respond('web_app_send_prepared_message', 'prepared_message_failed', { error: 'A' }),
    });
    const result = await safeShareMessage('id');
    expect(!result.ok && ShareMessageError.is(result.error)).toBe(true);
    await expect(shareMessage('id')).rejects.toThrow(ShareMessageError);
  });

  it('should return TimeoutError if the user did not respond in time', async () => {
    vi.useFakeTimers();
    setup();
    const promise = safeShareMessage('id', { timeout: 1000 });
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;
    expect(!result.ok && TimeoutError.is(result.error)).toBe(true);
    vi.useRealTimers();
  });
});

describe('isSupported', () => {
  it.each([
    { fn: shareMessage, name: 'shareMessage' },
    { fn: safeShareMessage, name: 'safeShareMessage' },
  ])('$name should check the Mini Apps version', ({ fn }) => {
    expect(fn.isSupported()).toBe(false);
    setup({ version: '7.10' });
    expect(fn.isSupported()).toBe(false);
    setup({ version: '8.0' });
    expect(fn.isSupported()).toBe(true);
  });
});
