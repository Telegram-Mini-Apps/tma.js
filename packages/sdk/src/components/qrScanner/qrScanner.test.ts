import { emitEvent, TimeoutError } from '@tma.js/bridge';
import { describe, expect, it, vi } from 'vitest';

import { createQrScanner } from './qrScanner.js';
import { setup } from '../../../test/utils.js';
import { ConcurrentCallError } from '../../errors.js';

describe('qrScanner', () => {
  it('should capture the matching QR code and close the scanner', async () => {
    const calls = setup();
    const scanner = createQrScanner();
    const promise = scanner.capture({ text: 'Scan', capture: qr => qr === 'b' });
    expect(scanner.isOpened()).toBe(true);
    emitEvent('qr_text_received', { data: 'a' });
    emitEvent('qr_text_received', { data: 'b' });
    await expect(promise).resolves.toBe('b');
    expect(scanner.isOpened()).toBe(false);
    expect(calls.mock.calls).toEqual([
      [{ name: 'web_app_open_scan_qr_popup', params: { text: 'Scan' } }],
      [{ name: 'web_app_close_scan_qr_popup', params: undefined }],
    ]);
  });

  it('should resolve when the user closes the scanner', async () => {
    setup();
    const scanner = createQrScanner();
    const onCaptured = vi.fn();
    const promise = scanner.open({ onCaptured });
    emitEvent('qr_text_received', { data: 'a' });
    emitEvent('scan_qr_popup_closed');
    await expect(promise).resolves.toBeUndefined();
    expect(onCaptured).toHaveBeenCalledWith('a');
    expect(scanner.isOpened()).toBe(false);
  });

  it('should reject with ConcurrentCallError if the scanner is opened', async () => {
    setup();
    const scanner = createQrScanner();
    void scanner.capture();
    await expect(scanner.open({ onCaptured: vi.fn() })).rejects.toThrow(ConcurrentCallError);
  });

  it('should close the scanner and return TimeoutError', async () => {
    vi.useFakeTimers();
    const calls = setup();
    const scanner = createQrScanner();
    const promise = scanner.safeCapture({ timeout: 100 });
    await vi.advanceTimersByTimeAsync(100);
    const result = await promise;
    expect(!result.ok && TimeoutError.is(result.error)).toBe(true);
    expect(calls).toHaveBeenLastCalledWith({ name: 'web_app_close_scan_qr_popup', params: undefined });
    vi.useRealTimers();
  });

  it('should close the scanner and reject when aborted', async () => {
    const calls = setup();
    const controller = new AbortController();
    const reason = new Error('aborted');
    const promise = createQrScanner().capture({ signal: controller.signal });
    controller.abort(reason);
    await expect(promise).rejects.toBe(reason);
    expect(calls).toHaveBeenLastCalledWith({ name: 'web_app_close_scan_qr_popup', params: undefined });
  });
});
