import { emitEvent, MethodUnsupportedError } from '@tma.js/bridge';
import { describe, expect, it, vi } from 'vitest';

import { createBackButton } from './backButton.js';
import { mockPageReload, setup } from '../../../test/utils.js';
import { NotInitializedError, NotMountedError } from '../../errors.js';

describe('backButton', () => {
  it('should throw NotInitializedError if the SDK is not initialized', () => {
    expect(() => createBackButton().mount()).toThrow(NotInitializedError);
  });

  it('should throw MethodUnsupportedError if the button is unsupported', () => {
    setup({ version: '6.0' });
    const button = createBackButton();
    expect(button.isSupported()).toBe(false);
    expect(() => button.mount()).toThrow(MethodUnsupportedError);
  });

  it('should throw NotMountedError if the button is not mounted', () => {
    setup();
    expect(() => createBackButton().show()).toThrow(NotMountedError);
  });

  it('should call the method only if the state changes', () => {
    const calls = setup();
    const button = createBackButton();
    button.mount();
    button.show();
    button.show();
    expect(button.isVisible()).toBe(true);
    button.hide();
    expect(button.isVisible()).toBe(false);
    expect(calls.mock.calls).toEqual([
      [{ name: 'web_app_setup_back_button', params: { is_visible: true } }],
      [{ name: 'web_app_setup_back_button', params: { is_visible: false } }],
    ]);
  });

  it('should notify subscribers about state and mount changes', () => {
    setup();
    const button = createBackButton();
    const listener = vi.fn();
    button.subscribe(listener);
    button.mount();
    button.show();
    button.unmount();
    expect(listener).toHaveBeenCalledTimes(3);
    expect(button.state()).toEqual({ isVisible: true });
  });

  it('should restore the state after the page reload', () => {
    setup();
    const button = createBackButton();
    button.mount();
    button.show();

    mockPageReload();
    const restored = createBackButton();
    restored.mount();
    expect(restored.isVisible()).toBe(true);
  });

  it('should restore the state only on the first mount after the page reload', () => {
    setup();
    const button = createBackButton();
    button.mount();
    button.show();

    mockPageReload();
    const restored = createBackButton();
    restored.mount();
    restored.hide();
    sessionStorage.setItem('tma.js/sdk/backButton', '{"isVisible":true}');
    restored.unmount();
    restored.mount();
    expect(restored.isVisible()).toBe(false);
  });

  it('should not restore the state if the page was not reloaded', () => {
    setup();
    const button = createBackButton();
    button.mount();
    button.show();

    const next = createBackButton();
    next.mount();
    expect(next.isVisible()).toBe(false);
  });

  it('should listen to clicks', () => {
    const button = createBackButton();
    const listener = vi.fn();
    const off = button.onClick(listener);
    emitEvent('back_button_pressed');
    off();
    emitEvent('back_button_pressed');
    expect(listener).toHaveBeenCalledOnce();

    button.onClick(listener);
    button.offClick(listener);
    emitEvent('back_button_pressed');
    expect(listener).toHaveBeenCalledOnce();
  });
});
