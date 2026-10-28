import { describe, expect, it, vi } from 'vitest';

import { TimeoutError, UnknownEnvError } from './errors.js';
import { emitEvent } from './events.js';
import { captureSameReq, createRequestId, request, safeRequest } from './request.js';

describe('request', () => {
  it('should call the method and resolve with the event payload', async () => {
    const postEvent = vi.fn(() => {
      emitEvent('popup_closed', { button_id: 'ok' });
    });
    const params = { buttons: [{ id: 'ok', type: 'ok' as const }], message: 'm', title: 't' };
    await expect(request('web_app_open_popup', 'popup_closed', { params, postEvent }))
      .resolves
      .toEqual({ button_id: 'ok' });
    expect(postEvent).toHaveBeenCalledWith('web_app_open_popup', params);
  });

  it('should resolve with the event name and payload when tracking a list of events', async () => {
    const promise = request('web_app_request_phone', ['phone_requested', 'popup_closed'], {
      postEvent: vi.fn(),
    });
    emitEvent('phone_requested', { status: 'sent' });
    await expect(promise).resolves.toEqual({
      event: 'phone_requested',
      payload: { status: 'sent' },
    });
  });

  it('should resolve only with the captured event', async () => {
    const promise = request('web_app_read_text_from_clipboard', 'clipboard_text_received', {
      capture: captureSameReq('b'),
      params: { req_id: 'b' },
      postEvent: vi.fn(),
    });
    emitEvent('clipboard_text_received', { data: 'a', req_id: 'a' });
    emitEvent('clipboard_text_received', { data: 'b', req_id: 'b' });
    await expect(promise).resolves.toEqual({ data: 'b', req_id: 'b' });
  });

  it('should reject with the capture function error', async () => {
    const error = new Error('oops');
    const promise = request('web_app_request_theme', 'theme_changed', {
      capture() {
        throw error;
      },
      postEvent: vi.fn(),
    });
    emitEvent('theme_changed', { theme_params: {} });
    await expect(promise).rejects.toBe(error);
  });

  it('should reject with TimeoutError', async () => {
    vi.useFakeTimers();
    const promise = request('web_app_request_theme', 'theme_changed', {
      postEvent: vi.fn(),
      timeout: 100,
    });
    vi.advanceTimersByTime(100);
    await expect(promise).rejects.toSatisfy(e => TimeoutError.is(e));
    vi.useRealTimers();
  });

  it('should reject with the abort reason', async () => {
    const controller = new AbortController();
    const reason = new Error('aborted');
    const promise = request('web_app_request_theme', 'theme_changed', {
      postEvent: vi.fn(),
      signal: controller.signal,
    });
    controller.abort(reason);
    await expect(promise).rejects.toBe(reason);

    const postEvent = vi.fn();
    await expect(request('web_app_request_theme', 'theme_changed', {
      postEvent,
      signal: controller.signal,
    })).rejects.toBe(reason);
    expect(postEvent).not.toHaveBeenCalled();
  });

  it('should reject with the postEvent error', async () => {
    await expect(request('web_app_request_theme', 'theme_changed'))
      .rejects
      .toSatisfy(e => UnknownEnvError.is(e));
  });

  it('should remove listeners after settling', async () => {
    const promise = request('web_app_request_theme', 'theme_changed', { postEvent: vi.fn() });
    emitEvent('theme_changed', { theme_params: {} });
    await promise;
    expect((window as any).Telegram).toBeUndefined();
  });
});

describe('safeRequest', () => {
  it('should resolve with the event payload', async () => {
    const postEvent = vi.fn(() => {
      emitEvent('phone_requested', { status: 'sent' });
    });
    await expect(safeRequest('web_app_request_phone', 'phone_requested', { postEvent }))
      .resolves
      .toEqual({ data: { status: 'sent' }, ok: true });
  });

  it('should resolve with TimeoutError', async () => {
    vi.useFakeTimers();
    const promise = safeRequest('web_app_request_theme', 'theme_changed', {
      postEvent: vi.fn(),
      timeout: 100,
    });
    vi.advanceTimersByTime(100);
    await expect(promise).resolves.toEqual({ error: new TimeoutError(100), ok: false });
    vi.useRealTimers();
  });

  it('should reject with the abort reason', async () => {
    const controller = new AbortController();
    const reason = new Error('aborted');
    controller.abort(reason);
    await expect(safeRequest('web_app_request_theme', 'theme_changed', {
      postEvent: vi.fn(),
      signal: controller.signal,
    })).rejects.toBe(reason);
  });
});

describe('createRequestId', () => {
  it('should create unique identifiers', () => {
    expect(createRequestId()).not.toBe(createRequestId());
  });
});
