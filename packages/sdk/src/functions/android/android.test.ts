import { describe, expect, it, vi } from 'vitest';

import { retrieveAndroidDeviceData, retrieveAndroidDeviceDataFrom } from './android.js';

describe('retrieveAndroidDeviceDataFrom', () => {
  it.each([
    { expected: {}, userAgent: '' },
    { expected: {}, userAgent: 'Mozilla/5.0 (Linux; Android 14)' },
    { expected: {}, userAgent: 'Telegram-Android' },
    { expected: { appVersion: '11.11.0' }, userAgent: 'Telegram-Android/11.11.0' },
    {
      expected: {
        androidVersion: '14',
        appVersion: '11.11.0',
        manufacturer: 'Samsung',
        model: 'SM-A155F',
        performanceClass: 'AVERAGE',
        sdkVersion: 34,
      },
      userAgent: 'Telegram-Android/11.11.0 (Samsung SM-A155F; Android 14; SDK 34; AVERAGE)',
    },
    {
      expected: {
        androidVersion: '15',
        appVersion: '11.11.0',
        manufacturer: 'Google',
        model: 'Pixel',
        performanceClass: 'HIGH',
        sdkVersion: 35,
      },
      userAgent: 'Mozilla/5.0 Telegram-Android/11.11.0 (Google Pixel; Android 15; SDK 35; HIGH) Mobile',
    },
  ])('should parse Android device data from "$userAgent"', ({ expected, userAgent }) => {
    expect(retrieveAndroidDeviceDataFrom(userAgent)).toStrictEqual(expected);
  });

  it('should skip the SDK version if it is not a number', () => {
    expect(retrieveAndroidDeviceDataFrom('Telegram-Android/11.11.0 (SDK abc)'))
      .toStrictEqual({ appVersion: '11.11.0' });
  });
});

describe('retrieveAndroidDeviceData', () => {
  it('should parse navigator.userAgent', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Telegram-Android/11.11.0 (LOW)');
    expect(retrieveAndroidDeviceData()).toStrictEqual({
      appVersion: '11.11.0',
      performanceClass: 'LOW',
    });
  });
});
