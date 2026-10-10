import { describe, expect, it } from 'vitest';

import { isColorDark, isRGB, safeToRGB, toRGB } from './colors.js';
import { InvalidColorError } from './errors.js';

describe('toRGB', () => {
  it.each([
    ['#abc', '#aabbcc'],
    ['#abcd', '#aabbcc'],
    ['#AABBCC', '#aabbcc'],
    ['#aabbccdd', '#aabbcc'],
    ['rgb(1, 2, 255)', '#0102ff'],
    ['rgba(1,2,3,0.5)', '#010203'],
  ])('should convert %s to %s', (input, expected) => {
    expect(toRGB(input)).toBe(expected);
  });

  it.each(['', 'red', '#ab', 'rgb(256,0,0)', '#aabbccd'])(
    'should return InvalidColorError for %s',
    input => {
      const result = safeToRGB(input);
      expect(!result.ok && InvalidColorError.is(result.error)).toBe(true);
    },
  );
});

describe('isRGB', () => {
  it('should accept only the #RRGGBB format', () => {
    expect(isRGB('#aabbcc')).toBe(true);
    expect(isRGB('#abc')).toBe(false);
  });
});

describe('isColorDark', () => {
  it('should detect dark colors', () => {
    expect(isColorDark('#000')).toBe(true);
    expect(isColorDark('#17212b')).toBe(true);
    expect(isColorDark('#ffffff')).toBe(false);
  });

  it('should throw InvalidColorError for invalid colors', () => {
    expect(() => isColorDark('red')).toThrow(InvalidColorError);
  });
});
