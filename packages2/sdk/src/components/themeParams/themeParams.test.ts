import { emitEvent } from '@tma.js/bridge';
import { describe, expect, it, vi } from 'vitest';

import { createThemeParams } from './themeParams.js';
import { setup } from '../../../test/utils.js';
import { CSSVarsBoundError, NotInitializedError, NotMountedError } from '../../errors.js';

const style = () => document.documentElement.style;

describe('themeParams', () => {
  it('should require the SDK to be initialized', () => {
    expect(() => createThemeParams().mount()).toThrow(NotInitializedError);
  });

  it('should take the theme from launch parameters and follow its changes', () => {
    setup({ launchParams: { tgWebAppThemeParams: { bg_color: '#ffffff' } } });
    const theme = createThemeParams();
    theme.mount();
    expect(theme.bgColor()).toBe('#ffffff');
    expect(theme.isDark()).toBe(false);

    const listener = vi.fn();
    theme.subscribe(listener);
    emitEvent('theme_changed', { theme_params: { bg_color: '#000000', text_color: '#ffffff' } });
    expect(listener).toHaveBeenCalledOnce();
    expect(theme.state()).toEqual({ bg_color: '#000000', text_color: '#ffffff' });
    expect(theme.isDark()).toBe(true);

    theme.unmount();
    emitEvent('theme_changed', { theme_params: { bg_color: '#ffffff' } });
    expect(theme.bgColor()).toBe('#000000');
  });

  it('should bind CSS variables', () => {
    setup({ launchParams: { tgWebAppThemeParams: { bg_color: '#ffffff' } } });
    const theme = createThemeParams();
    expect(() => theme.bindCssVars()).toThrow(NotMountedError);
    theme.mount();

    const unbind = theme.bindCssVars();
    expect(theme.isCssVarsBound()).toBe(true);
    expect(() => theme.bindCssVars()).toThrow(CSSVarsBoundError);
    expect(style().getPropertyValue('--tg-theme-bg-color')).toBe('#ffffff');

    emitEvent('theme_changed', { theme_params: { secondary_bg_color: '#000000' } });
    expect(style().getPropertyValue('--tg-theme-bg-color')).toBe('');
    expect(style().getPropertyValue('--tg-theme-secondary-bg-color')).toBe('#000000');

    unbind();
    expect(theme.isCssVarsBound()).toBe(false);
    expect(style().getPropertyValue('--tg-theme-secondary-bg-color')).toBe('');
  });

  it('should ignore repeated unbind calls', () => {
    setup({ launchParams: { tgWebAppThemeParams: { bg_color: '#ffffff' } } });
    const theme = createThemeParams();
    theme.mount();
    const unbind = theme.bindCssVars();
    unbind();
    theme.bindCssVars();
    unbind();
    expect(theme.isCssVarsBound()).toBe(true);
    expect(style().getPropertyValue('--tg-theme-bg-color')).toBe('#ffffff');
  });

  it('should use custom CSS variable names', () => {
    setup({ launchParams: { tgWebAppThemeParams: { bg_color: '#ffffff', text_color: '#000000' } } });
    const theme = createThemeParams();
    theme.mount();
    theme.bindCssVars(key => key === 'bg_color' && '--bg');
    expect(style().getPropertyValue('--bg')).toBe('#ffffff');
    expect(style().getPropertyValue('--tg-theme-text-color')).toBe('');
  });
});
