import { it, expect, afterEach, vi } from 'vitest';

import { retrieveAndroidDeviceData } from './retrieveAndroidDeviceData.js';

afterEach(() => {
  vi.restoreAllMocks();
});

it.each([
  { userAgent: '', expected: {} },
  { userAgent: 'Telegram-Android', expected: {} },
  {
    userAgent: 'Telegram-Android (Samsung SM-A155F; Android 14; SDK 34; AVERAGE)',
    expected: {
      manufacturer: 'Samsung',
      performanceClass: 'AVERAGE',
      model: 'SM-A155F',
      androidVersion: '14',
      sdkVersion: 34,
    },
  },
  {
    userAgent: 'Telegram-Android/11.11.0 (Samsung SM-A155F; AVERAGE)',
    expected: {
      appVersion: '11.11.0',
      manufacturer: 'Samsung',
      performanceClass: 'AVERAGE',
      model: 'SM-A155F',
    },
  },
  {
    userAgent: 'Telegram-Android/11.11.0 (Samsung SM-A155F; Android 14; SDK 34; AVERAGE)',
    expected: {
      appVersion: '11.11.0',
      manufacturer: 'Samsung',
      performanceClass: 'AVERAGE',
      model: 'SM-A155F',
      androidVersion: '14',
      sdkVersion: 34,
    },
  },
])('should properly parse user agent sample', ({ userAgent, expected }) => {
  vi.spyOn(navigator, 'userAgent', 'get').mockImplementation(() => userAgent);
  expect(retrieveAndroidDeviceData()).toStrictEqual(expected);
});
