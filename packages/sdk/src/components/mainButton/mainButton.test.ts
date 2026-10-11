import { emitEvent, MethodParameterUnsupportedError } from '@tma.js/bridge';
import { describe, expect, it, vi } from 'vitest';

import { createMainButton } from './mainButton.js';
import { setup } from '../../../test/utils.js';
import { createThemeParams } from '../themeParams/themeParams.js';

describe('mainButton', () => {
  it('should send the whole state omitting missing values', () => {
    const calls = setup();
    const button = createMainButton(createThemeParams());
    button.mount();
    button.setParams({ text: 'Submit', isVisible: true, bgColor: undefined });
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_setup_main_button',
      params: {
        has_shine_effect: false,
        is_active: true,
        is_progress_visible: false,
        is_visible: true,
        text: 'Submit',
      },
    });
    expect(button.text()).toBe('Submit');
  });

  it.each([
    ['show', 'isVisible', true],
    ['hide', 'isVisible', false],
    ['enable', 'isEnabled', true],
    ['disable', 'isEnabled', false],
    ['showLoader', 'isLoaderVisible', true],
    ['hideLoader', 'isLoaderVisible', false],
    ['enableShineEffect', 'hasShineEffect', true],
    ['disableShineEffect', 'hasShineEffect', false],
  ] as const)('%s should set %s to %s', (method, key, value) => {
    setup();
    const button = createMainButton(createThemeParams());
    button.mount();
    button.setParams({ [key]: !value });
    button[method]();
    expect(button.state()[key]).toBe(value);
  });

  it('should throw MethodParameterUnsupportedError for unsupported parameters', () => {
    setup({ version: '9.0' });
    const button = createMainButton(createThemeParams());
    button.mount();
    expect(() => button.setIconCustomEmojiId('1')).toThrow(MethodParameterUnsupportedError);
    expect(button.iconCustomEmojiId()).toBeUndefined();
    expect(() => button.show()).not.toThrow();
  });

  it('should take default colors from the theme', () => {
    setup({ launchParams: { tgWebAppThemeParams: { button_color: '#111111' } } });
    const theme = createThemeParams();
    const button = createMainButton(theme);
    expect(button.bgColor()).toBe('#2481cc');
    expect(button.textColor()).toBe('#ffffff');

    const listener = vi.fn();
    button.bgColor.subscribe(listener);
    theme.mount();
    expect(listener).toHaveBeenCalledExactlyOnceWith('#111111', '#2481cc');
    expect(button.bgColor()).toBe('#111111');

    button.mount();
    button.setBgColor('#222222');
    expect(button.bgColor()).toBe('#222222');
  });

  it('should listen to clicks', () => {
    const listener = vi.fn();
    createMainButton(createThemeParams()).onClick(listener);
    emitEvent('main_button_pressed');
    expect(listener).toHaveBeenCalledOnce();
  });
});

describe('support checks', () => {
  it('should check the button parameters support', () => {
    const button = createMainButton(createThemeParams());
    expect(button.setParams.isSupported()).toBe(false);
    expect(button.setParams.supports('hasShineEffect')).toBe(false);
    setup({ version: '7.9' });
    expect(button.setParams.isSupported()).toBe(true);
    expect(button.setParams.supports('hasShineEffect')).toBe(false);
    expect(button.enableShineEffect.isSupported()).toBe(false);
    expect(button.disableShineEffect.isSupported()).toBe(false);
    setup({ version: '7.10' });
    expect(button.setParams.supports('hasShineEffect')).toBe(true);
    expect(button.enableShineEffect.isSupported()).toBe(true);
    expect(button.setParams.supports('iconCustomEmojiId')).toBe(false);
    expect(button.setIconCustomEmojiId.isSupported()).toBe(false);
    setup({ version: '9.5' });
    expect(button.setParams.supports('iconCustomEmojiId')).toBe(true);
    expect(button.setIconCustomEmojiId.isSupported()).toBe(true);
  });
});
