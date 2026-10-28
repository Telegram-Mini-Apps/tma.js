import {
  emitEvent,
  LaunchParamsRetrieveError,
  MethodUnsupportedError,
  mockTelegramEnv,
} from '@tma.js/bridge';
import { describe, expect, it, vi } from 'vitest';

import { getGlobals, isInitialized } from './globals.js';
import { init, safeInit } from './init.js';

const launchParams = {
  tgWebAppPlatform: 'tdesktop',
  tgWebAppThemeParams: {},
  tgWebAppVersion: '6.0',
};

describe('safeInit', () => {
  it('should return LaunchParamsRetrieveError if launch parameters are missing', () => {
    const result = safeInit();
    expect(!result.ok && LaunchParamsRetrieveError.is(result.error)).toBe(true);
    expect(isInitialized()).toBe(false);
  });

  it('should retrieve launch parameters', () => {
    mockTelegramEnv({ launchParams });
    expect(safeInit().ok).toBe(true);
    expect(getGlobals()).toMatchObject({ launchParams, version: '6.0' });
  });
});

describe('init', () => {
  it('should use a postEvent function checking the method support', () => {
    mockTelegramEnv();
    init({ launchParams });
    expect(() => getGlobals().postEvent('web_app_open_popup', {
      buttons: [],
      message: 'm',
      title: '',
    })).toThrow(MethodUnsupportedError);
  });

  it('should use the passed postEvent function', () => {
    const postEvent = vi.fn();
    init({ launchParams, postEvent });
    getGlobals().postEvent('web_app_ready');
    expect(postEvent).toHaveBeenCalledWith('web_app_ready');
  });

  describe('iframe', () => {
    it('should notify the parent, apply custom styles and reload the page', () => {
      vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
      const postEvent = vi.fn();
      const reload = vi.fn();
      vi.stubGlobal('location', { ...window.location, reload });
      const cleanup = init({ launchParams, postEvent });
      expect(postEvent).toHaveBeenCalledWith('iframe_ready', { reload_supported: true });

      emitEvent('set_custom_style', '.a{color:red}');
      const style = document.getElementById('telegram-custom-styles');
      expect(style && style.textContent).toBe('.a{color:red}');

      emitEvent('reload_iframe');
      expect(postEvent).toHaveBeenCalledWith('iframe_will_reload');
      expect(reload).toHaveBeenCalledOnce();

      cleanup();
      expect(document.getElementById('telegram-custom-styles')).toBeNull();
    });

    it('should remove handlers of the previous call', () => {
      vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
      init({ launchParams, postEvent: vi.fn() });
      init({ launchParams, postEvent: vi.fn() });
      expect(document.querySelectorAll('#telegram-custom-styles')).toHaveLength(1);
    });

    it('should not add styles if acceptCustomStyles is false', () => {
      vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
      init({ acceptCustomStyles: false, launchParams, postEvent: vi.fn() });
      expect(document.getElementById('telegram-custom-styles')).toBeNull();
    });
  });

  it('should not notify the parent outside iframes', () => {
    const postEvent = vi.fn();
    init({ launchParams, postEvent });
    expect(postEvent).not.toHaveBeenCalled();
  });
});
