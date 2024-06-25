import { expect, it, vi, afterEach } from 'vitest';
import { saveToStorage } from '@/launch-params/saveToStorage.js';

afterEach(() => {
  vi.restoreAllMocks();
});

it('should call sessionStorage.setItem with "telegram-apps/launch-params" and serialized launch params', () => {
  const spy = vi.spyOn(sessionStorage, 'setItem').mockImplementation(() => undefined);
  saveToStorage({
    version: '7.0',
    platform: 'android',
    themeParams: {
      bgColor: '#ffffff',
    },
  });
  expect(spy).toHaveBeenCalledOnce();
  expect(spy).toHaveBeenCalledWith(
    'telegram-apps/launch-params',
    '"tgWebAppPlatform=android&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23ffffff%22%7D&tgWebAppVersion=7.0"',
  );
});