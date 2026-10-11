import { mockTelegramEnv } from '@tma.js/sdk';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import { useLaunchParams, useRawInitData, useRawLaunchParams } from './launch-params.js';

function render(useValue: () => unknown): string {
  function App() {
    return JSON.stringify(useValue());
  }
  return renderToString(createElement(App));
}

afterEach(() => {
  sessionStorage.clear();
});

describe('launch params hooks', () => {
  it('should return launch parameters', () => {
    mockTelegramEnv({
      launchParams: 'tgWebAppPlatform=tdesktop&tgWebAppVersion=9.0&tgWebAppThemeParams=%7B%7D&tgWebAppData=auth_date%3D1',
    });
    expect(render(useRawLaunchParams)).toContain('tgWebAppPlatform=tdesktop');
    expect(render(() => useLaunchParams().tgWebAppPlatform)).toContain('tdesktop');
    expect(render(useRawInitData)).toContain('auth_date=1');
  });
});
