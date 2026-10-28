import { InvokeCustomMethodFailedError } from '@tma.js/bridge';
import { describe, expect, it } from 'vitest';

import { getCurrentTime, safeGetCurrentTime } from './getCurrentTime.js';
import { respondCustomMethod, setup } from '../../../test/utils.js';
import { InvalidResponseError } from '../../errors.js';

describe('getCurrentTime', () => {
  it('should return the server time', async () => {
    setup({ onMethod: respondCustomMethod('getCurrentTime', { result: 10 }) });
    await expect(getCurrentTime()).resolves.toEqual(new Date(10000));
  });

  it('should return InvalidResponseError for unexpected values', async () => {
    setup({ onMethod: respondCustomMethod('getCurrentTime', { result: '10' }) });
    const result = await safeGetCurrentTime();
    expect(!result.ok && InvalidResponseError.is(result.error)).toBe(true);
  });

  it('should return InvokeCustomMethodFailedError if the Telegram client failed', async () => {
    setup({ onMethod: respondCustomMethod('getCurrentTime', { error: 'UNKNOWN' }) });
    const result = await safeGetCurrentTime();
    expect(!result.ok && InvokeCustomMethodFailedError.is(result.error)).toBe(true);
  });
});

describe('isSupported', () => {
  it.each([
    { fn: getCurrentTime, name: 'getCurrentTime' },
    { fn: safeGetCurrentTime, name: 'safeGetCurrentTime' },
  ])('$name should check the Mini Apps version', ({ fn }) => {
    expect(fn.isSupported()).toBe(false);
    setup({ version: '6.8' });
    expect(fn.isSupported()).toBe(false);
    setup({ version: '6.9' });
    expect(fn.isSupported()).toBe(true);
  });
});
