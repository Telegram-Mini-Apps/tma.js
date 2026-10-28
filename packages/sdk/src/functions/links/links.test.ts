import { describe, expect, it, vi } from 'vitest';

import {
  isTelegramHostname,
  openLink,
  openTelegramLink,
  safeOpenLink,
  safeOpenTelegramLink,
  shareURL,
} from './links.js';
import { setup } from '../../../test/utils.js';
import { InvalidArgumentsError } from '../../errors.js';

describe('isTelegramHostname', () => {
  it.each(['t.me', 'telegram.me', 'telegram.dog'])('should return true for %s', hostname => {
    expect(isTelegramHostname(hostname)).toBe(true);
  });

  it.each(['example.com', 'web.telegram.org', 't.me.example.com'])(
    'should return false for %s',
    hostname => {
      expect(isTelegramHostname(hostname)).toBe(false);
    },
  );
});

describe('openLink', () => {
  it('should open the link', () => {
    const calls = setup();
    openLink('https://example.com', { tryBrowser: 'chrome', tryInstantView: true });
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_open_link',
      params: { try_browser: 'chrome', try_instant_view: true, url: 'https://example.com/' },
    });
  });

  it('should return InvalidArgumentsError for invalid URLs', () => {
    setup();
    const result = safeOpenLink('/relative');
    expect(!result.ok && InvalidArgumentsError.is(result.error)).toBe(true);
  });
});

describe('openTelegramLink', () => {
  it('should open the Telegram link', () => {
    const calls = setup();
    openTelegramLink('https://t.me/heyqbnk?start=1', { forceRequest: true });
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_open_tg_link',
      params: { force_request: true, path_full: '/heyqbnk?start=1' },
    });
  });

  it('should change the location before v6.1', () => {
    setup({ version: '6.0' });
    vi.stubGlobal('location', { href: '' });
    openTelegramLink('https://t.me/heyqbnk');
    expect(window.location.href).toBe('https://telegram.me/heyqbnk');
  });

  it('should return InvalidArgumentsError for invalid URLs', () => {
    setup();
    const result = safeOpenTelegramLink('/heyqbnk');
    expect(!result.ok && InvalidArgumentsError.is(result.error)).toBe(true);
  });

  it('should return InvalidArgumentsError for non-Telegram links', () => {
    setup();
    const result = safeOpenTelegramLink('https://example.com/heyqbnk');
    expect(!result.ok && InvalidArgumentsError.is(result.error)).toBe(true);
  });
});

describe('shareURL', () => {
  it('should open the share link encoding spaces with %20', () => {
    const calls = setup();
    shareURL('https://example.com', 'Look at this');
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_open_tg_link',
      params: { path_full: '/share/url?url=https%3A%2F%2Fexample.com&text=Look%20at%20this' },
    });
  });

  it('should pass an empty text if it is missing', () => {
    const calls = setup();
    shareURL('https://example.com');
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_open_tg_link',
      params: { path_full: '/share/url?url=https%3A%2F%2Fexample.com&text=' },
    });
  });
});

describe('isSupported', () => {
  it.each([
    { fn: openLink, name: 'openLink' },
    { fn: safeOpenLink, name: 'safeOpenLink' },
    { fn: openTelegramLink, name: 'openTelegramLink' },
    { fn: safeOpenTelegramLink, name: 'safeOpenTelegramLink' },
    { fn: shareURL, name: 'shareURL' },
  ])(
    '$name should check if the SDK is initialized',
    ({ fn }) => {
      expect(fn.isSupported()).toBe(false);
      setup({ version: '6.0' });
      expect(fn.isSupported()).toBe(true);
    },
  );
});

describe('supports', () => {
  it.each([
    { fn: openLink, name: 'openLink' },
    { fn: safeOpenLink, name: 'safeOpenLink' },
  ])('$name should check the options support', ({ fn }) => {
    expect(fn.supports('tryInstantView')).toBe(false);
    setup({ version: '6.3' });
    expect(fn.supports('tryInstantView')).toBe(false);
    setup({ version: '6.4' });
    expect(fn.supports('tryInstantView')).toBe(true);
    expect(fn.supports('tryBrowser')).toBe(false);
    setup({ version: '7.6' });
    expect(fn.supports('tryBrowser')).toBe(true);
  });
});
