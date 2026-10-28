import { MethodUnsupportedError, TimeoutError } from '@tma.js/bridge';
import { describe, expect, it, vi } from 'vitest';

import { downloadFile, safeDownloadFile } from './downloadFile.js';
import { respond, setup } from '../../../test/utils.js';
import { AccessDeniedError } from '../../errors.js';

describe('downloadFile', () => {
  it('should resolve if the download started', async () => {
    const calls = setup({
      onMethod: respond('web_app_request_file_download', 'file_download_requested', {
        status: 'downloading',
      }),
    });
    await expect(downloadFile('https://example.com/a.txt', 'a.txt')).resolves.toBeUndefined();
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_request_file_download',
      params: { file_name: 'a.txt', url: 'https://example.com/a.txt' },
    });
  });

  it('should return AccessDeniedError if the user declined the download', async () => {
    setup({ onMethod: respond('web_app_request_file_download', 'file_download_requested', {}) });
    const result = await safeDownloadFile('https://example.com/a.txt', 'a.txt');
    expect(!result.ok && AccessDeniedError.is(result.error)).toBe(true);
    await expect(downloadFile('https://example.com/a.txt', 'a.txt'))
      .rejects.toThrow(AccessDeniedError);
  });

  it('should return TimeoutError if the user did not respond in time', async () => {
    vi.useFakeTimers();
    setup();
    const promise = safeDownloadFile('https://example.com/a.txt', 'a.txt', { timeout: 1000 });
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;
    expect(!result.ok && TimeoutError.is(result.error)).toBe(true);
    vi.useRealTimers();
  });

  it('should throw MethodUnsupportedError before v8.0', async () => {
    setup({ version: '7.10' });
    await expect(downloadFile('https://example.com/a.txt', 'a.txt'))
      .rejects.toThrow(MethodUnsupportedError);
  });
});

describe('isSupported', () => {
  it.each([
    { fn: downloadFile, name: 'downloadFile' },
    { fn: safeDownloadFile, name: 'safeDownloadFile' },
  ])('$name should check the Mini Apps version', ({ fn }) => {
    expect(fn.isSupported()).toBe(false);
    setup({ version: '7.10' });
    expect(fn.isSupported()).toBe(false);
    setup({ version: '8.0' });
    expect(fn.isSupported()).toBe(true);
  });
});
