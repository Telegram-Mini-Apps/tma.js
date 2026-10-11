import { describe, expect, it } from 'vitest';

import {
  isAnyRGB,
  isRGB, isRGBA,
  isRGBAShort,
  isRGBShort,
  toRGB,
  toRGBFp,
  toRGBFull,
  toRGBFullFp,
} from './rgb.js';

describe('isRGB', () => {
  it('should return true for a value in the #RRGGBB format', () => {
    expect(isRGB('#ffffff')).toBe(true);
  });

  it('should return false for any other value', () => {
    ['abc', '#ffff', '#fff', '#fffffg'].forEach(v => {
      expect(isRGB(v)).toBe(false);
    });
  });
});

describe('isRGBA', () => {
  it('should return true for a value in the #RRGGBBAA format', () => {
    expect(isRGBA('#ffffffaa')).toBe(true);
  });

  it('should return false for any other value', () => {
    ['abc', '#ffff', '#fff', '#fffffg', '#ffffff'].forEach(v => {
      expect(isRGBA(v)).toBe(false);
    });
  });
});

describe('isRGBShort', () => {
  it('should return true for a value in the #RGB format', () => {
    expect(isRGBShort('#fff')).toBe(true);
  });

  it('should return false for any other value', () => {
    ['abc', '#ffff', '#ffffff', '#ggg'].forEach(v => {
      expect(isRGBShort(v)).toBe(false);
    });
  });
});

describe('isRGBAShort', () => {
  it('should return true for a value in the #RGBA format', () => {
    expect(isRGBAShort('#fffa')).toBe(true);
  });

  it('should return false for any other value', () => {
    ['abc', '#ffffffaa', '#ffffff', '#ggg'].forEach(v => {
      expect(isRGBAShort(v)).toBe(false);
    });
  });
});

describe('isAnyRGB', () => {
  it.each([
    ['#RGB', '#abc'],
    ['#RGBA', '#abcd'],
    ['#RRGGBB', '#aabbcc'],
    ['#RRGGBBAA', '#aabbccdd'],
  ] as const)('should return true for a value in the %s format', (_, value) => {
    expect(isAnyRGB(value)).toBe(true);
  });
});

describe('toRGBFp', () => {
  it('should return same value in case, full version of RGB is passed', () => {
    expect(toRGBFp('#ffffff')).toMatchObject({ right: '#ffffff' });
  });

  it('should return full RGB value in case, its short presentation is passed', () => {
    expect(toRGBFp('#abc')).toMatchObject({ right: '#aabbcc' });
  });

  it('should return RGB representation of rgb(*,*,*) pattern', () => {
    expect(toRGBFp('rgb(6,56,11)')).toMatchObject({ right: '#06380b' });
  });

  it('should return RGB representation of rgba(*,*,*) pattern', () => {
    expect(toRGBFp('rgba(6,56,11,22)')).toMatchObject({ right: '#06380b' });
  });

  it('should throw an error in other cases', () => {
    expect(toRGBFp('abc')).toMatchObject({ left: expect.anything() });
  });
});

describe('toRGB', () => {
  it('should return same value in case, full version of RGB is passed', () => {
    expect(toRGB('#ffffff')).toBe('#ffffff');
  });

  it('should return full RGB value in case, its short presentation is passed', () => {
    expect(toRGB('#abc')).toBe('#aabbcc');
  });

  it('should return RGB representation of rgb(*,*,*) pattern', () => {
    expect(toRGB('rgb(6,56,11)')).toBe('#06380b');
  });

  it('should return RGB representation of rgba(*,*,*) pattern', () => {
    expect(toRGB('rgba(6,56,11,22)')).toBe('#06380b');
  });

  it('should throw an error in other cases', () => {
    expect(() => toRGB('abc')).toThrow();
  });
});

describe('toRGBFullFp', () => {
  it('should expand the value if it has #RGB or #RGBA formats', () => {
    expect(toRGBFullFp('#abc')).toMatchObject({ right: '#aabbccff' });
    expect(toRGBFullFp('#abcd')).toMatchObject({ right: '#aabbccdd' });
  });

  it('should fulfill alpha channel part with "ff" of the value has #RRGGBB format', () => {
    expect(toRGBFullFp('#aabbcc')).toMatchObject({ right: '#aabbccff' });
  });

  it('should return value as-is if it has #RRGGBBAA format', () => {
    expect(toRGBFullFp('#aabbccdd')).toMatchObject({ right: '#aabbccdd' });
  });

  it('should properly handle rgb(*,*,*) format', () => {
    expect(toRGBFullFp('rgb(6,56,11)')).toMatchObject({ right: '#06380bff' });
  });

  it('should properly handle rgba(*,*,*,*) format', () => {
    expect(toRGBFullFp('rgba(6,56,11,3)')).toMatchObject({ right: '#06380b03' });
  });

  it('should return an error in other cases', () => {
    expect(toRGBFullFp('abc')).toMatchObject({ left: expect.anything() });
  });
});

describe('toRGBFull', () => {
  it('should expand the value if it has #RGB or #RGBA formats', () => {
    expect(toRGBFull('#abc')).toBe('#aabbccff');
    expect(toRGBFull('#abcd')).toBe('#aabbccdd');
  });

  it('should fulfill alpha channel part with "ff" of the value has #RRGGBB format', () => {
    expect(toRGBFull('#aabbcc')).toBe('#aabbccff');
  });

  it('should return value as-is if it has #RRGGBBAA format', () => {
    expect(toRGBFull('#aabbccdd')).toBe('#aabbccdd');
  });

  it('should properly handle rgb(*,*,*) format', () => {
    expect(toRGBFull('rgb(6,56,11)')).toBe('#06380bff');
  });

  it('should properly handle rgba(*,*,*,*) format', () => {
    expect(toRGBFull('rgba(6,56,11,3)')).toBe('#06380b03');
  });

  it('should throw an error in other cases', () => {
    expect(() => toRGBFull('abc')).toThrow();
  });
});
