import { describe, expect, it, vi } from 'vitest';

import { InvalidLaunchParamsError, LaunchParamsRetrieveError } from './errors.js';
import {
  parseLaunchParams,
  retrieveLaunchParams,
  retrieveRawInitData,
  retrieveRawLaunchParams,
  safeParseLaunchParams,
  safeRetrieveLaunchParams,
  safeRetrieveRawInitData,
  safeRetrieveRawLaunchParams,
  serializeLaunchParams,
} from './launch-params.js';
import { catchError } from '../test/catchError.js';

const QUERY = 'tgWebAppVersion=9.0&tgWebAppPlatform=ios&tgWebAppData=user%3D1'
  + '&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23ffffff%22%7D&tgWebAppFullscreen=1';

function mockLocation(href: string) {
  vi.spyOn(window, 'location', 'get').mockReturnValue({ href } as Location);
}

function mockNavigationEntry(name?: string) {
  vi.spyOn(performance, 'getEntriesByType').mockReturnValue(
    name ? [{ name } as PerformanceEntry] : [],
  );
}

describe('parseLaunchParams', () => {
  it('should parse launch parameters', () => {
    expect(parseLaunchParams(QUERY)).toEqual({
      tgWebAppVersion: '9.0',
      tgWebAppPlatform: 'ios',
      tgWebAppData: 'user=1',
      tgWebAppThemeParams: { bg_color: '#ffffff' },
      tgWebAppFullscreen: true,
    });
  });

  it('should pass the cause to InvalidLaunchParamsError', () => {
    const error = catchError(() => parseLaunchParams('tgWebAppVersion=9.0'));
    expect(error).toSatisfy(e => InvalidLaunchParamsError.is(e));
    expect((error as InvalidLaunchParamsError).cause).toBeInstanceOf(Error);
    expect((error as InvalidLaunchParamsError).data).toEqual({ value: 'tgWebAppVersion=9.0' });
  });

  it('should throw if required parameters are missing', () => {
    expect(catchError(() => parseLaunchParams('tgWebAppVersion=9.0'))).toSatisfy(e => InvalidLaunchParamsError.is(e));
  });

  it('should throw if theme parameters are invalid', () => {
    expect(catchError(() => parseLaunchParams('tgWebAppVersion=9&tgWebAppPlatform=ios&tgWebAppThemeParams={')))
      .toSatisfy(e => InvalidLaunchParamsError.is(e));
  });

  it.each([
    ['an invalid color', '{"bg_color":"red"}'],
    ['not an object', '"#ffffff"'],
  ])('should throw if theme parameters contain %s', (_, json) => {
    const query = new URLSearchParams({
      tgWebAppVersion: '9.0',
      tgWebAppPlatform: 'ios',
      tgWebAppThemeParams: json,
    });
    expect(catchError(() => parseLaunchParams(query)))
      .toSatisfy(e => InvalidLaunchParamsError.is(e));
  });

  it('should convert numeric theme colors and accept short colors', () => {
    const query = new URLSearchParams({
      tgWebAppVersion: '9.0',
      tgWebAppPlatform: 'ios',
      tgWebAppThemeParams: JSON.stringify({ bg_color: 0xFF00AA, text_color: '#FFF' }),
    });
    expect(parseLaunchParams(query).tgWebAppThemeParams)
      .toEqual({ bg_color: '#ff00aa', text_color: '#FFF' });
  });

  it('should drop unknown parameters', () => {
    expect(parseLaunchParams('tgWebAppVersion=9.0&tgWebAppPlatform=ios&foo=bar'))
      .toEqual({ tgWebAppVersion: '9.0', tgWebAppPlatform: 'ios', tgWebAppThemeParams: {} });
  });
});

describe('safeParseLaunchParams', () => {
  it('should return launch parameters', () => {
    expect(safeParseLaunchParams(QUERY)).toEqual({ ok: true, data: parseLaunchParams(QUERY) });
  });

  it('should return InvalidLaunchParamsError instead of throwing it', () => {
    const result = safeParseLaunchParams('tgWebAppVersion=9.0');
    expect(!result.ok && InvalidLaunchParamsError.is(result.error)).toBe(true);
  });
});

describe('serializeLaunchParams', () => {
  it('should be reversible by parseLaunchParams', () => {
    const lp = parseLaunchParams(QUERY);
    expect(parseLaunchParams(serializeLaunchParams(lp))).toEqual(lp);
  });
});

describe('retrieveRawLaunchParams', () => {
  it('should retrieve launch parameters from the URL hash and save them', () => {
    mockLocation(`https://example.com/path?a=1#${QUERY}`);
    const raw = retrieveRawLaunchParams();
    expect(parseLaunchParams(raw).tgWebAppVersion).toBe('9.0');
    expect(sessionStorage.getItem('tma.js/launch-params')).toBe(raw);
  });

  it('should retrieve launch parameters from the navigation entry', () => {
    mockLocation('https://example.com');
    mockNavigationEntry(`https://example.com#${QUERY}`);
    expect(retrieveLaunchParams().tgWebAppPlatform).toBe('ios');
  });

  it('should retrieve launch parameters from the session storage', () => {
    mockLocation('https://example.com');
    mockNavigationEntry();
    sessionStorage.setItem('tma.js/launch-params', QUERY);
    expect(retrieveRawLaunchParams()).toBe(QUERY);
  });

  it('should retrieve launch parameters saved by the official SDK', () => {
    mockLocation('https://example.com');
    mockNavigationEntry();
    sessionStorage.setItem('__telegram__initParams', JSON.stringify({
      tgWebAppVersion: '8.0',
      tgWebAppPlatform: 'android',
      tgWebAppData: 'user=1&hash=2',
    }));
    expect(retrieveLaunchParams()).toMatchObject({
      tgWebAppVersion: '8.0',
      tgWebAppPlatform: 'android',
      tgWebAppData: 'user=1&hash=2',
    });
  });

  it('should throw LaunchParamsRetrieveError if there are no launch parameters', () => {
    mockLocation('https://example.com');
    mockNavigationEntry();
    expect(catchError(() => retrieveRawLaunchParams()))
      .toSatisfy(e => LaunchParamsRetrieveError.is(e));
  });
});

describe('retrieveRawInitData', () => {
  it('should return raw init data', () => {
    mockLocation(`https://example.com#${QUERY}`);
    expect(retrieveRawInitData()).toBe('user=1');
  });

  it('should return undefined if init data is missing', () => {
    mockLocation('https://example.com#tgWebAppVersion=9.0&tgWebAppPlatform=ios');
    expect(retrieveRawInitData()).toBeUndefined();
  });
});

describe('safe retrieve functions', () => {
  it('should return launch parameters', () => {
    mockLocation(`https://example.com#${QUERY}`);
    expect(safeRetrieveRawLaunchParams()).toEqual({ ok: true, data: QUERY });
    expect(safeRetrieveLaunchParams()).toEqual({ ok: true, data: parseLaunchParams(QUERY) });
    expect(safeRetrieveRawInitData()).toEqual({ ok: true, data: 'user=1' });
  });

  it('should return LaunchParamsRetrieveError if there are no launch parameters', () => {
    mockLocation('https://example.com');
    mockNavigationEntry();
    [safeRetrieveRawLaunchParams(), safeRetrieveLaunchParams(), safeRetrieveRawInitData()]
      .forEach(result => {
        expect(!result.ok && LaunchParamsRetrieveError.is(result.error)).toBe(true);
      });
  });
});
