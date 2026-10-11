import { MethodUnsupportedError } from '@tma.js/bridge';
import { describe, expect, it } from 'vitest';

import { hideKeyboard } from './hideKeyboard.js';
import { setup } from '../../../test/utils.js';

describe('hideKeyboard', () => {
  it('should call the method', () => {
    const calls = setup();
    hideKeyboard();
    expect(calls).toHaveBeenCalledWith({ name: 'web_app_hide_keyboard', params: undefined });
  });

  it('should throw MethodUnsupportedError before v9.1', () => {
    setup({ version: '9.0' });
    expect(() => hideKeyboard()).toThrow(MethodUnsupportedError);
  });
});

describe('isSupported', () => {
  it('should check the Mini Apps version', () => {
    expect(hideKeyboard.isSupported()).toBe(false);
    setup({ version: '9.0' });
    expect(hideKeyboard.isSupported()).toBe(false);
    setup({ version: '9.1' });
    expect(hideKeyboard.isSupported()).toBe(true);
  });
});
