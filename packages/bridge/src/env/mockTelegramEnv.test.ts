import { createWindow } from 'test-utils';
import { it, expect, afterEach, vi, describe } from 'vitest';

import { resetGlobals } from '@/globals.js';
import { retrieveLaunchParams } from '@/launch-params.js';
import { postEvent } from '@/methods/postEvent.js';

import { mockTelegramEnv } from './mockTelegramEnv.js';

afterEach(() => {
  vi.restoreAllMocks();
  resetGlobals();
});

it('should store launch parameters retuning them from retrieveLaunchParams', () => {
  const launchParams = {
    tgWebAppThemeParams: {
      accent_text_color: '#6ab2f2',
      bg_color: '#17212b',
      button_color: '#5288c1',
      button_text_color: '#ffffff',
      destructive_text_color: '#ec3942',
      header_bg_color: '#17212b',
      hint_color: '#708499',
      link_color: '#6ab3f3',
      secondary_bg_color: '#232e3c',
      section_bg_color: '#17212b',
      section_header_text_color: '#6ab3f3',
      subtitle_text_color: '#708499',
      text_color: '#f5f5f5',
    },
    tgWebAppData: 'chat_type=sender&auth_date=1736409902&signature=FNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA&hash=4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d90v',
    tgWebAppVersion: '7.2',
    tgWebAppPlatform: 'tdesktop',
    tgWebAppBotInline: false,
    tgWebAppShowSettings: false,
  } as const;

  createWindow({ location: { href: '' } } as any);

  expect(retrieveLaunchParams).toThrow();
  mockTelegramEnv({ launchParams });
  expect(retrieveLaunchParams()).toStrictEqual({
    tgWebAppThemeParams: {
      accent_text_color: '#6ab2f2',
      bg_color: '#17212b',
      button_color: '#5288c1',
      button_text_color: '#ffffff',
      destructive_text_color: '#ec3942',
      header_bg_color: '#17212b',
      hint_color: '#708499',
      link_color: '#6ab3f3',
      secondary_bg_color: '#232e3c',
      section_bg_color: '#17212b',
      section_header_text_color: '#6ab3f3',
      subtitle_text_color: '#708499',
      text_color: '#f5f5f5',
    },
    tgWebAppData: {
      chat_type: 'sender',
      auth_date: new Date(1736409902000),
      signature: 'FNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA',
      hash: '4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d90v',
    },
    tgWebAppVersion: '7.2',
    tgWebAppPlatform: 'tdesktop',
    tgWebAppBotInline: false,
    tgWebAppShowSettings: false,
  });
});

describe('env is iframe', () => {
  it('should call onEvent when postEvent is called', () => {
    createWindow({ env: 'iframe' });
    const spy = vi.fn();
    mockTelegramEnv({ onEvent: spy });
    postEvent('web_app_data_send', { data: 'Data!' });
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith(
      { name: 'web_app_data_send', params: { data: 'Data!' } },
      expect.anything(),
    );
  });

  it('should call previously defined window.parent.postMessage if next is called', () => {
    createWindow({ env: 'iframe' });
    const spy = vi.spyOn(window.parent, 'postMessage');
    mockTelegramEnv({
      onEvent(_, next) {
        next();
      },
    });
    postEvent('web_app_data_send', { data: 'Data!' });
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith(
      '{"eventType":"web_app_data_send","eventData":{"data":"Data!"}}',
      'https://web.telegram.org',
    );
  });
});

describe('env is not iframe', () => {
  it('should define window.TelegramWebviewProxy.postEvent()', () => {
    createWindow();
    expect(window).not.toHaveProperty('TelegramWebviewProxy');
    mockTelegramEnv();
    const postEvent = (window as any).TelegramWebviewProxy.postEvent;
    expect(typeof postEvent).toBe('function');
  });

  it('should call onEvent when postEvent is called', () => {
    createWindow();
    const spy = vi.fn();
    mockTelegramEnv({ onEvent: spy });
    postEvent('web_app_data_send', { data: 'Data!' });
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith(
      { name: 'web_app_data_send', params: { data: 'Data!' } },
      expect.anything(),
    );
  });

  it(
    'should call previously defined window.TelegramWebviewProxy.postEvent if next is called',
    () => {
      const spy = vi.fn();
      createWindow({ TelegramWebviewProxy: { postEvent: spy } } as any);
      mockTelegramEnv({
        onEvent(_, next) {
          next();
        },
      });
      postEvent('web_app_data_send', { data: 'Data!' });
      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith('web_app_data_send', '{"data":"Data!"}');
    },
  );
});
