import { describe, expect, it, vi } from 'vitest';

import { MethodParameterUnsupportedError, MethodUnsupportedError } from './errors.js';
import { setLogger } from './logger.js';
import { compareVersions, createPostEvent, getReleaseVersion, supports } from './versions.js';
import { catchError } from '../test/catchError.js';

describe('compareVersions', () => {
  it.each([
    ['6.10', '6.9', 1],
    ['6.9', '6.10', -1],
    ['7', '7.0', 0],
    ['7.0.1', '7', 1],
  ] as const)('%s vs %s = %s', (a, b, expected) => {
    expect(compareVersions(a, b)).toBe(expected);
  });
});

describe('getReleaseVersion', () => {
  it('should return the method release version', () => {
    expect(getReleaseVersion('web_app_ready')).toBe('6.0');
    expect(getReleaseVersion('web_app_setup_settings_button')).toBe('6.10');
    expect(getReleaseVersion('web_app_request_chat')).toBe('9.6');
  });

  it('should return the method parameter release version', () => {
    expect(getReleaseVersion('web_app_set_header_color', 'color')).toBe('6.9');
    expect(getReleaseVersion('web_app_setup_main_button', 'icon_custom_emoji_id')).toBe('9.5');
  });
});

describe('supports', () => {
  it('should check the method support', () => {
    expect(supports('web_app_open_popup', '6.1')).toBe(false);
    expect(supports('web_app_open_popup', '6.2')).toBe(true);
    expect(supports('web_app_open_popup', '10')).toBe(true);
  });

  it('should check the method parameter support', () => {
    expect(supports('web_app_open_link', 'try_browser', '7.5')).toBe(false);
    expect(supports('web_app_open_link', 'try_browser', '7.6')).toBe(true);
  });
});

describe('createPostEvent', () => {
  it('should call the method if it is supported', () => {
    const postEvent = vi.fn();
    (window as any).TelegramWebviewProxy = { postEvent };
    createPostEvent('6.9')('web_app_set_header_color', { color: '#ffffff' });
    expect(postEvent).toHaveBeenCalledOnce();
  });

  it('should throw in strict mode', () => {
    const postEvent = createPostEvent('6.0');
    const popup = { title: '', message: '', buttons: [] };
    expect(catchError(() => postEvent('web_app_open_popup', popup)))
      .toSatisfy(e => MethodUnsupportedError.is(e));
    const setColor = createPostEvent('6.1');
    expect(catchError(() => setColor('web_app_set_header_color', { color: '#ffffff' })))
      .toSatisfy(e => MethodParameterUnsupportedError.is(e));
  });

  it('should warn in non-strict mode', () => {
    const warn = vi.fn();
    setLogger({ log: vi.fn(), warn, error: vi.fn() });
    createPostEvent('6.0', 'non-strict')('web_app_request_phone');
    expect(warn).toHaveBeenCalledOnce();
  });

  it('should call the custom handler', () => {
    const onUnsupported = vi.fn();
    createPostEvent('9.4', onUnsupported)('web_app_setup_main_button', {
      icon_custom_emoji_id: '1',
    });
    expect(onUnsupported).toHaveBeenCalledWith({
      version: '9.4',
      method: 'web_app_setup_main_button',
      param: 'icon_custom_emoji_id',
    });
  });
});
