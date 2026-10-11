import { expect, it } from 'vitest';

import { isColorDark } from './isColorDark.js';

it('should return true in case, the value which is equal to Math.sqrt(0.299 * R * R + 0.587 * G * G + 0.114 * B * B) is less than 120 and false otherwise', () => {
  expect(isColorDark('#17212b')).toBe(true);
  expect(isColorDark('#f5f5f5')).toBe(false);
});

it('should throw an error in case, passed value has not convertable to RGB format', () => {
  expect(() => isColorDark('abc')).toThrow();
});
