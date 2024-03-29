import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { createWindow, type WindowSpy } from '../../../../test-utils/createWindow';
import { dispatchWindowMessageEvent } from '../../../../test-utils/dispatchWindowMessageEvent';
import { subscribe } from '../subscribe';

let windowSpy: WindowSpy;

beforeEach(() => {
  windowSpy = createWindow();
});

afterEach(() => {
  windowSpy.mockRestore();
});

it('should call listener in case, Telegram event was created', () => {
  const listener = vi.fn();
  subscribe(listener);

  const eventData = {
    height: 123,
    width: 321,
    is_expanded: false,
    is_state_stable: false,
  };
  dispatchWindowMessageEvent('viewport_changed', eventData);

  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith('viewport_changed', eventData);
});

it('should remove listener in case, returned callback was called', () => {
  const listener = vi.fn();
  const emit = () => dispatchWindowMessageEvent('viewport_changed', {
    height: 123,
    width: 321,
    is_expanded: false,
    is_state_stable: false,
  });

  const unsubscribe = subscribe(listener);
  emit();
  expect(listener).toHaveBeenCalledTimes(1);

  unsubscribe();
  emit();
  expect(listener).toHaveBeenCalledTimes(1);
});
