import { expect, it, vi, afterEach } from 'vitest';

import { retrieveFromStorage } from './retrieveFromStorage.js';

afterEach(() => {
  vi.restoreAllMocks();
});

it('should return launch parameters from the session storage telegram-apps/launch-params key. If data is missing or invalid, throw an error', () => {
  const spy = vi
    .spyOn(sessionStorage, 'getItem')
    .mockImplementationOnce(() => '');
  expect(() => retrieveFromStorage()).toThrow();

  spy.mockClear();
  spy.mockImplementationOnce(() => {
    return '"tgWebAppPlatform=android&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23ffffff%22%7D&tgWebAppVersion=7.0"';
  });
  expect(retrieveFromStorage()).toStrictEqual({
    version: '7.0',
    platform: 'android',
    themeParams: {
      bgColor: '#ffffff',
    },
  });
  expect(spy).toHaveBeenCalledOnce();
  expect(spy).toHaveBeenCalledWith('telegram-apps/launch-params');
});