import { describe, expect, it, vi } from 'vitest';

import { retrieveAndroidDeviceData, retrieveAndroidDeviceDataFrom } from './android.js';

describe('retrieveAndroidDeviceDataFrom', () => {
  it.each([
    { userAgent: '', expected: {} },
    { userAgent: 'Mozilla/5.0 (Linux; Android 14)', expected: {} },
    { userAgent: 'Telegram-Android', expected: {} },
    { userAgent: 'Telegram-Android/11.11.0', expected: { appVersion: '11.11.0' } },
    {
      userAgent: 'Telegram-Android/11.11.0 (Samsung SM-A155F; Android 14; SDK 34; AVERAGE)',
      expected: {
        appVersion: '11.11.0',
        manufacturer: 'Samsung',
        model: 'SM-A155F',
        androidVersion: '14',
        sdkVersion: 34,
        performanceClass: 'AVERAGE',
      },
    },
    {
      userAgent: 'Mozilla/5.0 Telegram-Android/11.11.0 (Google Pixel; Android 15; SDK 35; HIGH) Mobile',
      expected: {
        appVersion: '11.11.0',
        manufacturer: 'Google',
        model: 'Pixel',
        androidVersion: '15',
        sdkVersion: 35,
        performanceClass: 'HIGH',
      },
    },
  ])('should parse Android device data from "$userAgent"', ({ userAgent, expected }) => {
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
