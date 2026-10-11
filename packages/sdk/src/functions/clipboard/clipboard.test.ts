import {
  emitEvent,
  MethodUnsupportedError,
  type MockedMethodCall,
  TimeoutError,
} from '@tma.js/bridge';
import { describe, expect, it, vi } from 'vitest';

import {
  copyTextToClipboard,
  readTextFromClipboard,
  safeReadTextFromClipboard,
} from './clipboard.js';
import { setup } from '../../../test/utils.js';
import { NotInitializedError } from '../../errors.js';

describe('copyTextToClipboard', () => {
  /**
   * Mocks `document.execCommand` saving the text area value at the moment of copying.
   * @returns List of copied texts.
   */
  function mockExecCommand() {
    const copied: string[] = [];
    (document as any).execCommand = vi.fn(() => {
      copied.push((document.activeElement as HTMLTextAreaElement).value);
      return true;
    });
    return copied;
  }

  it('should use the Clipboard API', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    await copyTextToClipboard('text');
    expect(writeText).toHaveBeenCalledWith('text');
  });

  it('should fall back to the copy command if the Clipboard API is missing', async () => {
    vi.stubGlobal('navigator', {});
    const copied = mockExecCommand();
    await copyTextToClipboard('text');
    expect(copied).toEqual(['text']);
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('should fall back to the copy command if the Clipboard API failed', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: () => Promise.reject(new Error('Not allowed')) },
    });
    const copied = mockExecCommand();
    await copyTextToClipboard('text');
    expect(copied).toEqual(['text']);
  });

  it('should remove the text area if the copy command failed', async () => {
    vi.stubGlobal('navigator', {});
    const error = new Error('Failed');
    (document as any).execCommand = () => {
      throw error;
    };
    await expect(copyTextToClipboard('text')).rejects.toBe(error);
    expect(document.querySelector('textarea')).toBeNull();
  });
});

describe('readTextFromClipboard', () => {
  /**
   * @returns Function responding to the clipboard read with the data.
   */
  function respondText(data?: string | null) {
    return (call: MockedMethodCall) => {
      const { req_id } = call.params as { req_id: string };
      emitEvent('clipboard_text_received', { req_id, data });
    };
  }

  it('should return the clipboard text', async () => {
    const calls = setup({ onMethod: respondText('text') });
    await expect(readTextFromClipboard()).resolves.toBe('text');
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_read_text_from_clipboard',
      params: { req_id: expect.any(String) },
    });
  });

  it.each([undefined, null])('should return null if the data is %s', async data => {
    setup({ onMethod: respondText(data) });
    await expect(readTextFromClipboard()).resolves.toBeNull();
  });

  it('should ignore responses to other requests', async () => {
    setup({
      onMethod(call) {
        emitEvent('clipboard_text_received', { req_id: 'other', data: 'other' });
        respondText('text')(call);
      },
    });
    await expect(readTextFromClipboard()).resolves.toBe('text');
  });

  it('should return TimeoutError if the Telegram client did not respond in time', async () => {
    vi.useFakeTimers();
    setup();
    const promise = safeReadTextFromClipboard({ timeout: 1000 });
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;
    expect(!result.ok && TimeoutError.is(result.error)).toBe(true);
    vi.useRealTimers();
  });

  it('should throw MethodUnsupportedError before v6.4', async () => {
    setup({ version: '6.3' });
    await expect(readTextFromClipboard()).rejects.toThrow(MethodUnsupportedError);
  });

  it('should throw NotInitializedError if the SDK is not initialized', async () => {
    await expect(readTextFromClipboard()).rejects.toThrow(NotInitializedError);
  });
});

describe('isSupported', () => {
  it.each([
    { name: 'readTextFromClipboard', fn: readTextFromClipboard, supported: '6.4', unsupported: '6.3' },
    { name: 'safeReadTextFromClipboard', fn: safeReadTextFromClipboard, supported: '6.4', unsupported: '6.3' },
  ])('$name should check the Mini Apps version', ({ fn, supported, unsupported }) => {
    expect(fn.isSupported()).toBe(false);
    setup({ version: unsupported });
    expect(fn.isSupported()).toBe(false);
    setup({ version: supported });
    expect(fn.isSupported()).toBe(true);
  });
});
