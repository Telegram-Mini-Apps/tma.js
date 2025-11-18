import { describe, expect, it } from 'vitest';

import { decodeBase64Url, decodeBase64UrlFp, encodeBase64Url } from '@/base64-url.js';

describe('decodeBase64Url', () => {
  it('should properly decode ASCII value', () => {
    expect(decodeBase64Url('QUJDREVG')).toBe('ABCDEF');
  });

  it('should properly decode Unicode value', () => {
    expect(decodeBase64Url('0KLQtdC70LXQs9GA0LDQvA==')).toBe('Телеграм');
  });
});

describe('decodeBase64UrlFp', () => {
  it('should properly decode ASCII value', () => {
    expect(decodeBase64UrlFp('QUJDREVG')).toMatchObject({ right: 'ABCDEF' });
  });

  it('should properly decode Unicode value', () => {
    expect(decodeBase64UrlFp('0KLQtdC70LXQs9GA0LDQvA==')).toMatchObject({ right: 'Телеграм' });
  });
});

describe('encodeBase64Url', () => {
  it('should properly encode ASCII value', () => {
    expect(encodeBase64Url('ABCDEF')).toBe('QUJDREVG');
  });

  it('should properly encode Unicode value', () => {
    expect(encodeBase64Url('Телеграм')).toBe('0KLQtdC70LXQs9GA0LDQvA==');
  });
});
