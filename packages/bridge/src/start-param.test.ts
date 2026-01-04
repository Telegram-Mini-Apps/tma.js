import { either as E } from 'fp-ts';
import { describe, expect, it } from 'vitest';

import {
  createStartParam,
  createStartParamFp,
  decodeStartParam,
  decodeStartParamFp,
  isSafeToCreateStartParam,
} from './start-param.js';

describe('createStartParam', () => {
  it('should return value\'s base64 representation if its length is less than 513', () => {
    expect(createStartParam('ABCDEF')).toBe('QUJDREVG');
  });

  it(
    'should return a base64 value based on the value\'s JSON.stringify representation if the value is not a string',
    () => {
      expect(createStartParam({ field: 'value' })).toBe('eyJmaWVsZCI6InZhbHVlIn0=');
    },
  );

  it('should throw if value\'s base64 representation length exceeds 512', () => {
    expect(() => createStartParam(
      new Array(385)
        .fill('A')
        .join(''),
    )).toThrow('Value is too long for start parameter');
  });
});

describe('createStartParamFp', () => {
  it('should return value\'s base64 representation if its length is less than 513', () => {
    expect(createStartParamFp('ABCDEF')).toMatchObject({ right: 'QUJDREVG' });
  });

  it(
    'should return a base64 value based on the value\'s JSON.stringify representation if the value is not a string',
    () => {
      expect(createStartParamFp({ field: 'value' })).toMatchObject({ right: 'eyJmaWVsZCI6InZhbHVlIn0=' });
    },
  );

  it('should throw if value\'s base64 representation length exceeds 512', () => {
    expect(createStartParamFp(
      new Array(385)
        .fill('A')
        .join(''),
    )).toMatchObject({ left: new Error('Value is too long for start parameter') });
  });
});

describe('decodeStartParam', () => {
  it('should properly decode ASCII value', () => {
    expect(decodeStartParam('QUJDREVG')).toBe('ABCDEF');
  });

  it('should properly decode Unicode value', () => {
    expect(decodeStartParam('0KLQtdC70LXQs9GA0LDQvA==')).toBe('Телеграм');
  });

  it('should apply specified parser to the decoded value', () => {
    expect(
      decodeStartParam('0KLQtdC70LXQs9GA0LDQvA==', v => {
        return v === 'Телеграм' ? 'Телеграм Крута' : 'Телеграм Не Крута';
      }),
    ).toBe('Телеграм Крута');
  });

  it('should apply JSON.parse to the decoded value if the second argument is "json"', () => {
    expect(decodeStartParam('IlRlbGVncmFtIEtydXRhIg==', 'json')).toBe('Telegram Kruta');
  });

  it('should correctly decode a value returned from createStartParam', () => {
    const value = {
      string: 'gen-view',
      number: -3,
      array: [1, 'test', { field: 1 }, []],
    };
    expect(decodeStartParam(createStartParam(value), 'json')).toMatchObject(value);
  });
});

describe('decodeStartParamFp', () => {
  it('should properly decode ASCII value', () => {
    expect(decodeStartParamFp('QUJDREVG')).toMatchObject({ right: 'ABCDEF' });
  });

  it('should properly decode Unicode value', () => {
    expect(decodeStartParamFp('0KLQtdC70LXQs9GA0LDQvA==')).toMatchObject({ right: 'Телеграм' });
  });

  it('should apply specified parser to the decoded value', () => {
    expect(
      decodeStartParamFp('0KLQtdC70LXQs9GA0LDQvA==', v => {
        return E.right(v === 'Телеграм' ? 'Телеграм Крута' : 'Телеграм Не Крута');
      }),
    ).toMatchObject({ right: 'Телеграм Крута' });
  });

  it('should apply JSON.parse to the decoded value if the second argument is "json"', () => {
    expect(decodeStartParamFp('IlRlbGVncmFtIEtydXRhIg==', 'json')).toMatchObject({ right: 'Telegram Kruta' });
  });
});

describe('isSafeToCreateStartParam', () => {
  it('should return true if value\'s base64 representation length is less than 513', () => {
    expect(
      isSafeToCreateStartParam(new Array(384)
        .fill('A')
        .join('')),
    ).toBe(true);
  });

  it('should return false if value\'s base64 representation length exceeds 512', () => {
    expect(
      isSafeToCreateStartParam(new Array(385)
        .fill('A')
        .join('')),
    ).toBe(false);
  });
});
