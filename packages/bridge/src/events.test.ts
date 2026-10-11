import { describe, expect, it, vi } from 'vitest';

import { emitEvent, offAll, offAnyEvent, offEvent, onAnyEvent, onEvent } from './events.js';
import { setLogger } from './logger.js';

const w = window as any;

function receive(eventType: string, eventData?: unknown) {
  w.Telegram.WebView.receiveEvent(eventType, eventData);
}

describe('onEvent / offEvent', () => {
  it('should call the listener with the event payload', () => {
    const listener = vi.fn();
    onEvent('fullscreen_changed', listener);
    receive('fullscreen_changed', { is_fullscreen: true });
    receive('back_button_pressed');
    expect(listener).toHaveBeenCalledExactlyOnceWith({ is_fullscreen: true });
  });

  it('should remove the listener using the returned function and offEvent', () => {
    const listener = vi.fn();
    const stop = onEvent('back_button_pressed', listener);
    onEvent('main_button_pressed', listener);
    stop();
    offEvent('main_button_pressed', listener);
    emitEvent('back_button_pressed');
    emitEvent('main_button_pressed');
    expect(listener).not.toHaveBeenCalled();
  });

  it('should not add the same listener twice', () => {
    const listener = vi.fn();
    onEvent('back_button_pressed', listener);
    onEvent('back_button_pressed', listener);
    emitEvent('back_button_pressed');
    expect(listener).toHaveBeenCalledOnce();
  });

  it('should call the once listener only once', () => {
    const listener = vi.fn();
    onEvent('back_button_pressed', listener, { once: true });
    emitEvent('back_button_pressed');
    emitEvent('back_button_pressed');
    expect(listener).toHaveBeenCalledOnce();
  });

  it('should remove the listener when the signal is aborted', () => {
    const listener = vi.fn();
    const controller = new AbortController();
    onEvent('back_button_pressed', listener, { signal: controller.signal });
    controller.abort();
    emitEvent('back_button_pressed');
    onEvent('back_button_pressed', listener, { signal: controller.signal });
    emitEvent('back_button_pressed');
    expect(listener).not.toHaveBeenCalled();
  });

  it('should isolate listener errors', () => {
    const error = vi.fn();
    setLogger({ log: vi.fn(), warn: vi.fn(), error });
    const listener = vi.fn();
    onEvent('back_button_pressed', () => {
      throw new Error('oops');
    });
    onEvent('back_button_pressed', listener);
    emitEvent('back_button_pressed');
    expect(listener).toHaveBeenCalledOnce();
    expect(error).toHaveBeenCalledOnce();
  });
});

describe('onAnyEvent / offAnyEvent', () => {
  it('should call the listener with any event', () => {
    const listener = vi.fn();
    const stop = onAnyEvent(listener);
    receive('back_button_pressed');
    receive('fullscreen_changed', { is_fullscreen: false });
    expect(listener.mock.calls).toEqual([
      [{ name: 'back_button_pressed', payload: undefined }],
      [{ name: 'fullscreen_changed', payload: { is_fullscreen: false } }],
    ]);
    stop();
    emitEvent('back_button_pressed');
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('should remove the listener via offAnyEvent', () => {
    const listener = vi.fn();
    onAnyEvent(listener);
    offAnyEvent(listener);
    emitEvent('back_button_pressed');
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('receiving', () => {
  it.each([
    ['Telegram.WebView.receiveEvent', () => w.Telegram.WebView.receiveEvent],
    ['TelegramGameProxy.receiveEvent', () => w.TelegramGameProxy.receiveEvent],
    ['TelegramGameProxy_receiveEvent', () => w.TelegramGameProxy_receiveEvent],
  ])('should receive events via %s', (_, getFn) => {
    const listener = vi.fn();
    onEvent('back_button_pressed', listener);
    getFn()('back_button_pressed');
    expect(listener).toHaveBeenCalledOnce();
  });

  it('should receive messages from the parent window only', () => {
    const listener = vi.fn();
    onEvent('back_button_pressed', listener);
    const data = JSON.stringify({ eventType: 'back_button_pressed' });
    window.dispatchEvent(new MessageEvent('message', { data, source: window.parent }));
    window.dispatchEvent(new MessageEvent('message', { data }));
    window.dispatchEvent(new MessageEvent('message', { data: 'not json', source: window.parent }));
    window.dispatchEvent(new MessageEvent('message', { data: '{}', source: window.parent }));
    window.dispatchEvent(new MessageEvent('message', {
      data: JSON.stringify({ eventType: 1 }),
      source: window.parent,
    }));
    expect(listener).toHaveBeenCalledOnce();
  });

  it('should keep the receiveEvent defined before the installation', () => {
    const official = vi.fn();
    w.Telegram = { WebView: { receiveEvent: official } };
    const listener = vi.fn();
    onEvent('back_button_pressed', listener);
    receive('back_button_pressed');
    expect(listener).toHaveBeenCalledOnce();
    expect(official).toHaveBeenCalledWith('back_button_pressed', undefined);

    offAll();
    expect(w.Telegram.WebView.receiveEvent).toBe(official);
  });

  it('should keep working when the official SDK is loaded after the installation', () => {
    const listener = vi.fn();
    onEvent('back_button_pressed', listener);

    // This is what the official SDK does.
    const official = vi.fn();
    if (!w.Telegram) {
      w.Telegram = {};
    }
    w.Telegram.WebView = { initParams: {}, receiveEvent: official };
    w.TelegramGameProxy_receiveEvent = official;
    w.TelegramGameProxy = { receiveEvent: official };

    receive('back_button_pressed');
    w.TelegramGameProxy.receiveEvent('back_button_pressed');
    w.TelegramGameProxy_receiveEvent('back_button_pressed');
    expect(listener).toHaveBeenCalledTimes(3);
    expect(official).toHaveBeenCalledTimes(3);
    expect(w.Telegram.WebView.initParams).toEqual({});

    offAll();
    expect(w.Telegram.WebView.receiveEvent).toBe(official);
    expect(w.TelegramGameProxy.receiveEvent).toBe(official);
    expect(w.TelegramGameProxy_receiveEvent).toBe(official);
  });

  it('should remove created globals when there are no listeners left', () => {
    const stop = onEvent('back_button_pressed', vi.fn());
    expect(w.Telegram.WebView.receiveEvent).toBeTypeOf('function');
    stop();
    expect(w.Telegram).toBeUndefined();
    expect(w.TelegramGameProxy).toBeUndefined();
    expect(w.TelegramGameProxy_receiveEvent).toBeUndefined();
  });
});

describe('payload normalization', () => {
  it('should create viewport_changed payload if it is missing', () => {
    const listener = vi.fn();
    onEvent('viewport_changed', listener);
    receive('viewport_changed', null);
    receive('viewport_changed', { height: 1, is_expanded: false, is_state_stable: false });
    expect(listener.mock.calls).toEqual([
      [{
        height: window.innerHeight,
        width: window.innerWidth,
        is_expanded: true,
        is_state_stable: true,
      }],
      [{ height: 1, width: window.innerWidth, is_expanded: false, is_state_stable: false }],
    ]);
  });

  it('should normalize popup_closed payload', () => {
    const listener = vi.fn();
    onEvent('popup_closed', listener);
    receive('popup_closed');
    receive('popup_closed', { button_id: null });
    receive('popup_closed', { button_id: 'ok' });
    expect(listener.mock.calls).toEqual([[{}], [{}], [{ button_id: 'ok' }]]);
  });

  it('should convert numeric theme colors', () => {
    const listener = vi.fn();
    onEvent('theme_changed', listener);
    receive('theme_changed', { theme_params: { bg_color: 0xFF00AA, text_color: '#000000' } });
    expect(listener).toHaveBeenCalledWith({
      theme_params: { bg_color: '#ff00aa', text_color: '#000000' },
    });
  });
});

describe('payload validation', () => {
  it.each([
    ['clipboard_text_received', { data: 'text' }],
    ['custom_method_invoked', { req_id: '1', error: 1 }],
    ['popup_closed', { button_id: 1 }],
    ['theme_changed', { theme_params: { bg_color: 'red' } }],
    ['theme_changed', {}],
    ['viewport_changed', { height: '1', is_expanded: true, is_state_stable: true }],
  ] as const)('should drop invalid %s payload and log the error', (event, payload) => {
    const error = vi.fn();
    setLogger({ log: vi.fn(), warn: vi.fn(), error });
    const listener = vi.fn();
    onEvent(event, listener);
    receive(event, payload);
    expect(listener).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledOnce();
  });
});

describe('emitEvent', () => {
  it('should call Telegram.WebView.receiveEvent outside iframe', () => {
    const receiveEvent = vi.fn();
    w.Telegram = { WebView: { receiveEvent } };
    emitEvent('fullscreen_changed', { is_fullscreen: true });
    expect(receiveEvent).toHaveBeenCalledWith('fullscreen_changed', { is_fullscreen: true });
  });

  it('should dispatch a message from the parent window in iframe', () => {
    vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
    const listener = vi.fn();
    onEvent('fullscreen_changed', listener);
    const dispatch = vi.spyOn(window, 'dispatchEvent');
    emitEvent('fullscreen_changed', { is_fullscreen: true });
    expect(dispatch).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith({ is_fullscreen: true });
  });
});
