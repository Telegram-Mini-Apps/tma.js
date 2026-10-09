import { describe, expect, it } from 'vitest';

import { StartParamTooLongError } from './errors.js';
import {
  createStartParam,
  decodeBase64Url,
  decodeStartParam,
  encodeBase64Url,
  isSafeToCreateStartParam,
  safeCreateStartParam,
} from './start-param.js';
import { catchError } from '../test/catchError.js';

describe('base64url', () => {
  it('should encode and decode unicode strings', () => {
    const value = 'Привет, 世界! ✓ <>?';
    const encoded = encodeBase64Url(value);
    expect(encoded).toMatch(/^[\w-]*$/);
    expect(decodeBase64Url(encoded)).toBe(value);
  });

  it('should throw on invalid values', () => {
    expect(() => decodeBase64Url('%%%')).toThrow();
  });
});

describe('createStartParam / decodeStartParam', () => {
  it('should encode strings and JSON values', () => {
    expect(decodeStartParam(createStartParam('hello'))).toBe('hello');
    expect(decodeStartParam(createStartParam({ a: [1] }), 'json')).toEqual({ a: [1] });
    expect(decodeStartParam(createStartParam('42'), Number)).toBe(42);
  });

  it('should throw StartParamTooLongError', () => {
    expect(catchError(() => createStartParam('a'.repeat(400))))
      .toSatisfy(e => StartParamTooLongError.is(e));
    expect(isSafeToCreateStartParam('a'.repeat(384))).toBe(true);
    expect(isSafeToCreateStartParam('a'.repeat(385))).toBe(false);
  });

  it('should return StartParamTooLongError from safeCreateStartParam', () => {
    expect(safeCreateStartParam('42')).toEqual({ ok: true, data: createStartParam('42') });
    expect(safeCreateStartParam('a'.repeat(400)))
      .toEqual({ ok: false, error: new StartParamTooLongError(534) });
  });
});
