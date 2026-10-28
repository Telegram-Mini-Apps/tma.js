import { MethodUnsupportedError } from '@tma.js/bridge';
import { describe, expect, it } from 'vitest';

import { createSecondaryButton } from './secondaryButton.js';
import { setup } from '../../../test/utils.js';
import { createMiniApp } from '../miniApp/miniApp.js';
import { createThemeParams } from '../themeParams/themeParams.js';

describe('secondaryButton', () => {
  it('should be supported since Mini Apps v7.10', () => {
    setup({ version: '7.9' });
    const theme = createThemeParams();
    const button = createSecondaryButton(theme, createMiniApp(theme));
    expect(button.isSupported()).toBe(false);
    expect(() => button.mount()).toThrow(MethodUnsupportedError);
  });

  it('should support the shine effect together with the button', () => {
    setup({ version: '7.10' });
    const theme = createThemeParams();
    const button = createSecondaryButton(theme, createMiniApp(theme));
    expect(button.setParams.supports('hasShineEffect')).toBe(true);
    expect(button.enableShineEffect.isSupported()).toBe(true);
    expect(button.setParams.supports('iconCustomEmojiId')).toBe(false);
  });

  it('should send the position', () => {
    const calls = setup();
    const theme = createThemeParams();
    const button = createSecondaryButton(theme, createMiniApp(theme));
    button.mount();
    button.setPosition('top');
    expect(button.position()).toBe('top');
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_setup_secondary_button',
      params: expect.objectContaining({ position: 'top', text: 'Cancel' }),
    });
  });

  it('should take default colors from the bottom bar and the theme', () => {
    setup({
      launchParams: {
        tgWebAppThemeParams: { button_color: '#222222', secondary_bg_color: '#111111' },
      },
    });
    const theme = createThemeParams();
    const app = createMiniApp(theme);
    const button = createSecondaryButton(theme, app);
    expect(button.bgColor()).toBe('#ffffff');
    theme.mount();
    expect(button.bgColor()).toBe('#111111');
    app.mount();
    expect(button.bgColor()).toBe('#111111');
    expect(button.textColor()).toBe('#222222');
    app.setBottomBarColor('#333333');
    expect(button.bgColor()).toBe('#333333');
  });
});
