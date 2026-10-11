import { emitEvent, MethodParameterUnsupportedError } from '@tma.js/bridge';
import { describe, expect, it } from 'vitest';

import { createMiniApp } from './miniApp.js';
import { setup } from '../../../test/utils.js';
import { NotMountedError, UnknownThemeParamsKeyError } from '../../errors.js';
import { createThemeParams } from '../themeParams/themeParams.js';

const theme = { bg_color: '#ffffff', secondary_bg_color: '#eeeeee', button_color: '#2481cc' } as const;

function mount(version?: string) {
  const calls = setup({ version, launchParams: { tgWebAppThemeParams: theme } });
  const themeParams = createThemeParams();
  const app = createMiniApp(themeParams);
  app.mount();
  return { calls, app, themeParams };
}

describe('miniApp', () => {
  it('should mount themeParams', () => {
    const { app, themeParams } = mount();
    expect(themeParams.isMounted()).toBe(true);
    expect(app.bgColorRgb()).toBe('#ffffff');
    expect(app.isDark()).toBe(false);
  });

  it('should require the component to be mounted to set colors', () => {
    setup();
    const app = createMiniApp(createThemeParams());
    expect(() => app.setBgColor('#000000')).toThrow(NotMountedError);
  });

  it('should pass bg_color and secondary_bg_color header keys as is', () => {
    const { app, calls } = mount();
    app.setHeaderColor('secondary_bg_color');
    expect(app.headerColor()).toBe('secondary_bg_color');
    expect(app.headerColorRgb()).toBe('#eeeeee');
    expect(calls).toHaveBeenLastCalledWith({
      name: 'web_app_set_header_color',
      params: { color_key: 'secondary_bg_color' },
    });
  });

  it('should resolve theme keys and normalize colors', () => {
    const { app, calls } = mount();
    app.setHeaderColor('button_color');
    expect(calls).toHaveBeenLastCalledWith({
      name: 'web_app_set_header_color',
      params: { color: '#2481cc' },
    });
    app.setBgColor('#ABC');
    expect(app.bgColor()).toBe('#ABC');
    expect(app.bgColorRgb()).toBe('#aabbcc');
    expect(calls).toHaveBeenLastCalledWith({
      name: 'web_app_set_background_color',
      params: { color: '#aabbcc' },
    });
  });

  it('should use the secondary background color as the default bottom bar color', () => {
    const { app } = mount();
    expect(app.bottomBarColorRgb()).toBe('#eeeeee');
  });

  it('should return UnknownThemeParamsKeyError for unknown keys', () => {
    const { app } = mount();
    const proto = app.safeSetBgColor('constructor');
    expect(!proto.ok && UnknownThemeParamsKeyError.is(proto.error)).toBe(true);
    const result = app.safeSetBottomBarColor('link_color');
    expect(!result.ok && UnknownThemeParamsKeyError.is(result.error)).toBe(true);
    expect(app.bottomBarColor()).toBe('bottom_bar_bg_color');
  });

  it('should throw MethodParameterUnsupportedError for RGB header colors before v6.9', () => {
    const { app } = mount('6.8');
    expect(() => app.setHeaderColor('#000000')).toThrow(MethodParameterUnsupportedError);
    expect(() => app.setHeaderColor('secondary_bg_color')).not.toThrow();
  });

  it('should send colors following the theme when it changes', () => {
    const { app, calls } = mount();
    app.setBgColor('secondary_bg_color');
    app.setHeaderColor('secondary_bg_color');
    calls.mockClear();
    emitEvent('theme_changed', { theme_params: { ...theme, secondary_bg_color: '#000000' } });
    expect(calls.mock.calls).toEqual([
      [{ name: 'web_app_set_background_color', params: { color: '#000000' } }],
      // The default bottom bar color falls back to the secondary background color.
      [{ name: 'web_app_set_bottom_bar_color', params: { color: '#000000' } }],
    ]);
    expect(app.isDark()).toBe(true);
  });

  it('should track the activity', () => {
    const { app } = mount();
    expect(app.isActive()).toBe(true);
    emitEvent('visibility_changed', { is_visible: false });
    expect(app.isActive()).toBe(false);
  });

  it('should bind CSS variables', () => {
    const { app } = mount();
    app.bindCssVars();
    const { style } = document.documentElement;
    expect(style.getPropertyValue('--tg-bg-color')).toBe('#ffffff');
    expect(style.getPropertyValue('--tg-header-color')).toBe('#ffffff');
    expect(style.getPropertyValue('--tg-bottom-bar-color')).toBe('#eeeeee');
    app.setBgColor('#000000');
    expect(style.getPropertyValue('--tg-bg-color')).toBe('#000000');
  });

  it('should close and notify about readiness', () => {
    const { app, calls } = mount();
    app.ready();
    app.close(true);
    expect(calls).toHaveBeenCalledWith({ name: 'web_app_ready', params: undefined });
    expect(calls).toHaveBeenCalledWith({ name: 'web_app_close', params: { return_back: true } });
  });
});

describe('support checks', () => {
  it.each([
    { key: 'setBgColor', version: '6.1' },
    { key: 'safeSetBgColor', version: '6.1' },
    { key: 'setHeaderColor', version: '6.1' },
    { key: 'safeSetHeaderColor', version: '6.1' },
    { key: 'setBottomBarColor', version: '7.10' },
    { key: 'safeSetBottomBarColor', version: '7.10' },
  ] as const)('$key should be supported since Mini Apps v$version', ({ key, version }) => {
    const app = createMiniApp(createThemeParams());
    expect(app[key].isSupported()).toBe(false);
    setup({ version: '6.0' });
    expect(app[key].isSupported()).toBe(false);
    setup({ version });
    expect(app[key].isSupported()).toBe(true);
  });

  it.each(['setHeaderColor', 'safeSetHeaderColor'] as const)(
    '%s should support RGB since Mini Apps v6.9',
    key => {
      const app = createMiniApp(createThemeParams());
      expect(app[key].supports('rgb')).toBe(false);
      setup({ version: '6.8' });
      expect(app[key].supports('rgb')).toBe(false);
      setup({ version: '6.9' });
      expect(app[key].supports('rgb')).toBe(true);
    },
  );

  it('close should support returning back since Mini Apps v7.6', () => {
    const app = createMiniApp(createThemeParams());
    expect(app.close.isSupported()).toBe(false);
    expect(app.close.supports('returnBack')).toBe(false);
    setup({ version: '7.5' });
    expect(app.close.isSupported()).toBe(true);
    expect(app.close.supports('returnBack')).toBe(false);
    setup({ version: '7.6' });
    expect(app.close.supports('returnBack')).toBe(true);
  });
});
