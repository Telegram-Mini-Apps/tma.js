import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { useAndroidDeviceDataFrom } from './android.js';

describe('useAndroidDeviceDataFrom', () => {
  it('should return Android device data from the user agent', () => {
    function App() {
      const data = useAndroidDeviceDataFrom(
        'Telegram-Android/11.11.0 (Samsung SM-A155F; Android 14; SDK 34; AVERAGE)',
      );
      return JSON.stringify(data);
    }
    expect(JSON.parse(renderToString(createElement(App)).replace(/&quot;/g, '"'))).toEqual({
      appVersion: '11.11.0',
      manufacturer: 'Samsung',
      model: 'SM-A155F',
      androidVersion: '14',
      sdkVersion: 34,
      performanceClass: 'AVERAGE',
    });
  });
});
