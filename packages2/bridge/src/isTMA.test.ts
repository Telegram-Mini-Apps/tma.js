import { describe, expect, it, vi } from 'vitest';

import { emitEvent } from './events.js';
import { isTMA, isTMAAsync } from './isTMA.js';

function mockNoLaunchParams() {
  vi.spyOn(window, 'location', 'get').mockReturnValue({ href: 'https://example.com' } as Location);
  vi.spyOn(performance, 'getEntriesByType').mockReturnValue([]);
}

describe('isTMA', () => {
  it('should return true if TelegramWebviewProxy is defined', () => {
    (window as any).TelegramWebviewProxy = { postEvent: vi.fn() };
    expect(isTMA()).toBe(true);
  });

  it('should return true if launch parameters are available', () => {
    mockNoLaunchParams();
    sessionStorage.setItem('tma.js/launch-params', 'tgWebAppVersion=9&tgWebAppPlatform=ios');
    expect(isTMA()).toBe(true);
  });

  it('should return false otherwise', () => {
    mockNoLaunchParams();
    expect(isTMA()).toBe(false);
  });
});

describe('isTMAAsync', () => {
  it('should return true if TelegramWebviewProxy is defined', async () => {
    (window as any).TelegramWebviewProxy = { postEvent: vi.fn() };
    await expect(isTMAAsync()).resolves.toBe(true);
  });

  it('should return true if the Telegram client responded', async () => {
    vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
    vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {
      emitEvent('theme_changed', { theme_params: {} });
    });
    await expect(isTMAAsync()).resolves.toBe(true);
  });

  it('should return false if the Telegram client did not respond', async () => {
    vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
    vi.spyOn(window.parent, 'postMessage').mockImplementation(() => undefined);
    await expect(isTMAAsync({ timeout: 10 })).resolves.toBe(false);
  });

  it('should return false in an unknown environment', async () => {
    await expect(isTMAAsync()).resolves.toBe(false);
  });
});
