import { describe, expect, it, vi } from 'vitest';

import { InvalidLaunchParamsError } from './errors.js';
import { emitEvent } from './events.js';
import { mockTelegramEnv, type MockedMethodCall } from './mockTelegramEnv.js';
import { postEvent } from './postEvent.js';
import { request } from './request.js';
import { catchError } from '../test/catchError.js';

const w = window as any;

describe('mockTelegramEnv', () => {
  it('should save launch parameters', () => {
    mockTelegramEnv({
      launchParams: {
        tgWebAppVersion: '9.0',
        tgWebAppPlatform: 'tdesktop',
        tgWebAppThemeParams: { bg_color: '#000000' },
      },
    });
    expect(sessionStorage.getItem('tma.js/launch-params')).toBe(
      'tgWebAppVersion=9.0&tgWebAppPlatform=tdesktop&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23000000%22%7D',
    );
  });

  it('should throw if launch parameters are invalid', () => {
    expect(catchError(() => mockTelegramEnv({ launchParams: 'tgWebAppVersion=9' })))
      .toSatisfy(e => InvalidLaunchParamsError.is(e));
  });

  it('should make postEvent work outside Telegram', () => {
    mockTelegramEnv();
    expect(() => postEvent('web_app_ready')).not.toThrow();
  });

  it('should pass method calls to onMethod', () => {
    const onMethod = vi.fn();
    mockTelegramEnv({ onMethod });
    postEvent('web_app_ready');
    postEvent('web_app_setup_back_button', { is_visible: true });
    expect(onMethod.mock.calls.map(([call]) => call)).toEqual([
      { name: 'web_app_ready', params: undefined },
      { name: 'web_app_setup_back_button', params: { is_visible: true } },
    ]);
  });

  it('should allow responding to requests', async () => {
    mockTelegramEnv({
      onMethod({ name }) {
        name === 'web_app_request_phone' && emitEvent('phone_requested', { status: 'sent' });
      },
    });
    await expect(request('web_app_request_phone', 'phone_requested'))
      .resolves
      .toEqual({ status: 'sent' });
  });

  it('should pass the call to the previous proxy via next and restore it', () => {
    const original = { postEvent: vi.fn() };
    w.TelegramWebviewProxy = original;
    const restore = mockTelegramEnv({ onMethod: (_, next) => next() });
    postEvent('web_app_expand');
    expect(original.postEvent).toHaveBeenCalledWith('web_app_expand', '""');
    restore();
    expect(w.TelegramWebviewProxy).toBe(original);
  });

  it('should intercept calls in iframe without defining TelegramWebviewProxy', () => {
    vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
    const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => undefined);
    const onMethod = vi.fn((call: MockedMethodCall, next: VoidFunction) => {
      call.name === 'web_app_expand' && next();
    });
    const restore = mockTelegramEnv({ onMethod });
    expect(w.TelegramWebviewProxy).toBeUndefined();

    postEvent('web_app_ready');
    postEvent('web_app_setup_back_button', { is_visible: true });
    postEvent('web_app_expand');
    expect(onMethod.mock.calls.map(([call]) => call)).toEqual([
      { name: 'web_app_ready', params: undefined },
      { name: 'web_app_setup_back_button', params: { is_visible: true } },
      { name: 'web_app_expand', params: undefined },
    ]);
    expect(postMessage).toHaveBeenCalledExactlyOnceWith('{"eventType":"web_app_expand","eventData":""}', 'https://web.telegram.org');

    restore();
    postEvent('web_app_ready');
    expect(onMethod).toHaveBeenCalledTimes(3);
    expect(postMessage).toHaveBeenCalledTimes(2);
  });

  it('should do nothing in iframe without onMethod', () => {
    vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
    mockTelegramEnv();
    expect(w.TelegramWebviewProxy).toBeUndefined();
  });
});
