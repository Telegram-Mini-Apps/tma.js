import { afterEach, expect, it, vi } from 'vitest';

import { isPageReload } from './navigation.js';

afterEach(() => {
  vi.restoreAllMocks();
});

it('should return true if the first navigation entry type is "reload"', () => {
  const expected = { type: 'reload' };
  const spy = vi
    .spyOn(performance, 'getEntriesByType')
    .mockImplementationOnce(() => [expected] as any);

  expect(isPageReload()).toBe(true);
  spy.mockClear().mockImplementation(() => [{ type: 'navigation' }] as any);

  expect(isPageReload()).toBe(false);
});

it('should return false if the first navigation entry is missing', () => {
  vi
    .spyOn(performance, 'getEntriesByType')
    .mockImplementationOnce(() => []);

  expect(isPageReload()).toBe(false);
});
