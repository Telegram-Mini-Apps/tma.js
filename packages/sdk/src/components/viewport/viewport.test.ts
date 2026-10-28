import {
  emitEvent,
  MethodUnsupportedError,
  type MockedMethodCall,
  TimeoutError,
} from '@tma.js/bridge';
import { describe, expect, it, vi } from 'vitest';

import { createViewport } from './viewport.js';
import { mockPageReload, respond, setup } from '../../../test/utils.js';
import { FullscreenFailedError, NotInitializedError } from '../../errors.js';

const insets = { bottom: 2, left: 3, right: 4, top: 1 };
const noInsets = { bottom: 0, left: 0, right: 0, top: 0 };

/**
 * Responds to the safe areas requests.
 */
function respondInsets(call: MockedMethodCall): void {
  respond('web_app_request_safe_area', 'safe_area_changed', noInsets)(call);
  respond('web_app_request_content_safe_area', 'content_safe_area_changed', noInsets)(call);
}

describe('mount', () => {
  it('should use the window size on desktop platforms', async () => {
    const calls = setup({ launchParams: { tgWebAppFullscreen: true }, version: '7.0' });
    const viewport = createViewport();
    await viewport.mount();
    expect(calls).not.toHaveBeenCalled();
    expect(viewport.state()).toEqual({
      contentSafeAreaInsets: { bottom: 0, left: 0, right: 0, top: 0 },
      height: window.innerHeight,
      isExpanded: true,
      isFullscreen: true,
      isStable: true,
      safeAreaInsets: { bottom: 0, left: 0, right: 0, top: 0 },
      stableHeight: window.innerHeight,
      width: window.innerWidth,
    });
  });

  it('should request the viewport and safe areas on mobile platforms', async () => {
    setup({
      launchParams: { tgWebAppPlatform: 'android' },
      onMethod(call) {
        respond('web_app_request_viewport', 'viewport_changed', {
          height: 100,
          is_expanded: false,
          is_state_stable: false,
          width: 50,
        })(call);
        respond('web_app_request_safe_area', 'safe_area_changed', insets)(call);
        respond('web_app_request_content_safe_area', 'content_safe_area_changed', insets)(call);
      },
    });
    const viewport = createViewport();
    const promise = viewport.mount();
    expect(viewport.isMounting()).toBe(true);
    await promise;
    expect(viewport.isMounting()).toBe(false);
    expect(viewport.isMounted()).toBe(true);
    expect(viewport.state()).toMatchObject({
      contentSafeAreaInsets: insets,
      height: 100,
      isExpanded: false,
      isStable: false,
      safeAreaInsets: insets,
      stableHeight: 0,
      width: 50,
    });
  });

  it('should return TimeoutError if the Telegram client did not respond', async () => {
    vi.useFakeTimers();
    setup({ launchParams: { tgWebAppPlatform: 'ios' } });
    const viewport = createViewport();
    const promise = viewport.safeMount({ timeout: 100 });
    await vi.advanceTimersByTimeAsync(100);
    const result = await promise;
    expect(!result.ok && TimeoutError.is(result.error)).toBe(true);
    expect(viewport.isMounted()).toBe(false);
    vi.useRealTimers();
  });

  it('should not mount if unmounted while mounting', async () => {
    setup({ launchParams: { tgWebAppPlatform: 'ios' } });
    const viewport = createViewport();
    const promise = viewport.mount({ timeout: 1000 });
    viewport.unmount();
    emitEvent('viewport_changed', { height: 1, is_expanded: true, is_state_stable: true, width: 1 });
    emitEvent('safe_area_changed', noInsets);
    emitEvent('content_safe_area_changed', noInsets);
    await promise;
    expect(viewport.isMounted()).toBe(false);
    expect(viewport.isMounting()).toBe(false);
  });

  it('should reject with NotInitializedError if the SDK is not initialized', async () => {
    const promise = createViewport().safeMount();
    await expect(promise).rejects.toThrow(NotInitializedError);
  });

  it('should restore the state after the page reload', async () => {
    setup({ onMethod: respondInsets });
    const viewport = createViewport();
    await viewport.mount();
    emitEvent('viewport_changed', {
      height: 10,
      is_expanded: true,
      is_state_stable: true,
      width: 20,
    });

    mockPageReload();
    const calls = setup({ launchParams: { tgWebAppPlatform: 'ios' } });
    const restored = createViewport();
    await restored.mount();
    expect(calls).not.toHaveBeenCalled();
    expect(restored.height()).toBe(10);
  });
});

it('should follow viewport events', async () => {
  setup({ onMethod: respondInsets });
  const viewport = createViewport();
  await viewport.mount();
  emitEvent('viewport_changed', { height: 10, is_expanded: true, is_state_stable: false, width: 20 });
  expect(viewport.height()).toBe(10);
  expect(viewport.stableHeight()).toBe(window.innerHeight);
  expect(viewport.isStable()).toBe(false);
  emitEvent('viewport_changed', { height: 30, is_expanded: true, is_state_stable: true, width: 20 });
  expect(viewport.stableHeight()).toBe(30);
  expect(viewport.isStable()).toBe(true);
  emitEvent('fullscreen_changed', { is_fullscreen: true });
  expect(viewport.isFullscreen()).toBe(true);
  emitEvent('safe_area_changed', insets);
  expect(viewport.safeAreaInsets()).toEqual(insets);
  emitEvent('content_safe_area_changed', insets);
  expect(viewport.contentSafeAreaInsets()).toEqual(insets);

  viewport.unmount();
  emitEvent('viewport_changed', { height: 1, is_expanded: true, is_state_stable: true, width: 1 });
  expect(viewport.height()).toBe(30);
});

describe('fullscreen', () => {
  it('should update the state when fullscreen changes', async () => {
    setup({
      onMethod: respond('web_app_request_fullscreen', 'fullscreen_changed', { is_fullscreen: true }),
    });
    const viewport = createViewport();
    await viewport.requestFullscreen();
    expect(viewport.isFullscreen()).toBe(true);
  });

  it('should return FullscreenFailedError if the client failed', async () => {
    setup({
      onMethod: respond('web_app_exit_fullscreen', 'fullscreen_failed', { error: 'UNSUPPORTED' }),
    });
    const result = await createViewport().safeExitFullscreen();
    expect(!result.ok && FullscreenFailedError.is(result.error) && result.error.data)
      .toEqual({ error: 'UNSUPPORTED' });
  });

  it('should treat ALREADY_FULLSCREEN as success', async () => {
    setup({
      onMethod: respond('web_app_request_fullscreen', 'fullscreen_failed', {
        error: 'ALREADY_FULLSCREEN',
      }),
    });
    const viewport = createViewport();
    expect((await viewport.safeRequestFullscreen()).ok).toBe(true);
    expect(viewport.isFullscreen()).toBe(true);
  });

  it('should reject with MethodUnsupportedError before v8.0', async () => {
    setup({ version: '7.10' });
    const viewport = createViewport();
    expect(viewport.requestFullscreen.isSupported()).toBe(false);
    await expect(viewport.requestFullscreen()).rejects.toThrow(MethodUnsupportedError);
  });

  it.each([
    'requestFullscreen',
    'safeRequestFullscreen',
    'exitFullscreen',
    'safeExitFullscreen',
  ] as const)('%s should check the Mini Apps version', key => {
    const viewport = createViewport();
    expect(viewport[key].isSupported()).toBe(false);
    setup({ version: '7.10' });
    expect(viewport[key].isSupported()).toBe(false);
    setup({ version: '8.0' });
    expect(viewport[key].isSupported()).toBe(true);
  });
});

it('should bind CSS variables', async () => {
  setup({ onMethod: respondInsets });
  const viewport = createViewport();
  await viewport.mount();
  viewport.bindCssVars();
  emitEvent('safe_area_changed', insets);
  const { style } = document.documentElement;
  expect(style.getPropertyValue('--tg-viewport-height')).toBe(`${window.innerHeight}px`);
  expect(style.getPropertyValue('--tg-viewport-safe-area-inset-left')).toBe('3px');
  expect(style.getPropertyValue('--tg-viewport-content-safe-area-inset-top')).toBe('0px');
});

it('should expand the viewport', () => {
  const calls = setup();
  createViewport().expand();
  expect(calls).toHaveBeenCalledWith({ name: 'web_app_expand', params: undefined });
});
