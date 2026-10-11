import { afterAll, afterEach, expect, it, vi } from 'vitest';

import { isIframe } from './isIframe.js';

const windowSpy = vi.spyOn(window, 'window', 'get');

afterEach(() => {
  windowSpy.mockReset();
});

afterAll(() => {
  windowSpy.mockRestore();
});

it('should return true in case window.self !== window.top. Otherwise, false.', () => {
  windowSpy.mockImplementation(() => ({ self: 900, top: 1000 }) as any);
  expect(isIframe()).toBe(true);

  windowSpy.mockImplementation(() => ({ self: 900, top: 900 }) as any);
  expect(isIframe()).toBe(false);
});

it('should return true in case window.self getter threw an error', () => {
  windowSpy.mockImplementation(() => ({
    get self() {
      throw new Error();
    },
  }) as any);
  expect(isIframe()).toBe(true);
});
