import { either as E, option as O } from 'fp-ts';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  retrieveLaunchParams,
  retrieveLaunchParamsFp,
  retrieveRawInitData,
  retrieveRawInitDataFp,
  retrieveRawLaunchParams,
  retrieveRawLaunchParamsFp,
} from '@/launch-params.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('retrieveLaunchParams', () => {
  describe('window.location.href contains launch params', () => {
    it(
      'should retrieve launch params from the window.location.href. Throw an error if data is invalid or missing',
      () => {
        vi
          .spyOn(window.location, 'href', 'get')
          .mockImplementationOnce(() => {
            return '/abc?tgWebAppStartParam=location_hash#tgWebAppPlatform=tdesktop&tgWebAppVersion=7.0&tgWebAppThemeParams=%7B%7D';
          });

        expect(retrieveLaunchParams()).toStrictEqual({
          tgWebAppPlatform: 'tdesktop',
          tgWebAppVersion: '7.0',
          tgWebAppThemeParams: {},
          tgWebAppStartParam: 'location_hash',
        });
      },
    );
  });

  describe('first navigation entry contains launch params', () => {
    it(
      'should retrieve launch params from the window.performance. Throw an error if data is invalid or missing',
      () => {
        vi
          .spyOn(performance, 'getEntriesByType')
          .mockImplementationOnce(() => [{
            name: '/abc?tgWebAppStartParam=performance#tgWebAppPlatform=macos&tgWebAppVersion=7.3&tgWebAppThemeParams=%7B%7D',
          }] as any);

        expect(retrieveLaunchParams()).toStrictEqual({
          tgWebAppPlatform: 'macos',
          tgWebAppVersion: '7.3',
          tgWebAppThemeParams: {},
          tgWebAppStartParam: 'performance',
        });
      },
    );
  });

  describe('session storage contains launch params', () => {
    it(
      'should return launch parameters from the session storage tapps/launchParams key. If data is missing or invalid, throw an error',
      () => {
        const spy = vi
          .spyOn(sessionStorage, 'getItem')
          .mockImplementationOnce(() => '');
        expect(() => retrieveLaunchParams()).toThrow();

        spy.mockClear();
        spy.mockImplementationOnce(() => {
          return '"tgWebAppPlatform=android&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23ffffff%22%2C%22text_color%22%3A%22%23aabbccdd%22%7D&tgWebAppVersion=7.5"';
        });
        expect(retrieveLaunchParams()).toStrictEqual({
          tgWebAppVersion: '7.5',
          tgWebAppPlatform: 'android',
          tgWebAppThemeParams: {
            bg_color: '#ffffff',
            text_color: '#aabbccdd',
          },
        });
        expect(spy).toHaveBeenCalledOnce();
        expect(spy).toHaveBeenCalledWith('tapps/launchParams');
      },
    );
  });
});

describe('retrieveLaunchParamsFp', () => {
  describe('window.location.href contains launch params', () => {
    it(
      'should retrieve launch params from the window.location.href. Throw an error if data is invalid or missing',
      () => {
        vi
          .spyOn(window.location, 'href', 'get')
          .mockImplementationOnce(() => {
            return '/abc?tgWebAppStartParam=location_hash#tgWebAppPlatform=tdesktop&tgWebAppVersion=7.0&tgWebAppThemeParams=%7B%7D';
          });

        expect(retrieveLaunchParamsFp()).toStrictEqual(E.right({
          tgWebAppPlatform: 'tdesktop',
          tgWebAppVersion: '7.0',
          tgWebAppThemeParams: {},
          tgWebAppStartParam: 'location_hash',
        }));
      },
    );
  });

  describe('first navigation entry contains launch params', () => {
    it(
      'should retrieve launch params from the window.performance. Throw an error if data is invalid or missing',
      () => {
        vi
          .spyOn(performance, 'getEntriesByType')
          .mockImplementationOnce(() => [{
            name: '/abc?tgWebAppStartParam=performance#tgWebAppPlatform=macos&tgWebAppVersion=7.3&tgWebAppThemeParams=%7B%7D',
          }] as any);

        expect(retrieveLaunchParamsFp()).toStrictEqual(E.right({
          tgWebAppPlatform: 'macos',
          tgWebAppVersion: '7.3',
          tgWebAppThemeParams: {},
          tgWebAppStartParam: 'performance',
        }));
      },
    );
  });

  describe('session storage contains launch params', () => {
    it(
      'should return launch parameters from the session storage tapps/launchParams key. If data is missing or invalid, throw an error',
      () => {
        const spy = vi
          .spyOn(sessionStorage, 'getItem')
          .mockImplementationOnce(() => '');
        expect(retrieveLaunchParamsFp()).toMatchObject(E.left(expect.anything()));

        spy.mockClear();
        spy.mockImplementationOnce(() => {
          return '"tgWebAppPlatform=android&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23ffffff%22%7D&tgWebAppVersion=7.5"';
        });
        expect(retrieveLaunchParamsFp()).toStrictEqual(E.right({
          tgWebAppVersion: '7.5',
          tgWebAppPlatform: 'android',
          tgWebAppThemeParams: { bg_color: '#ffffff' },
        }));
        expect(spy).toHaveBeenCalledOnce();
        expect(spy).toHaveBeenCalledWith('tapps/launchParams');
      },
    );
  });
});

describe('retrieveRawInitData', () => {
  describe('window.location.href contains init data', () => {
    it(
      'should retrieve init data from the window.location.href. Throw an error if data is invalid or missing',
      () => {
        vi
          .spyOn(window.location, 'href', 'get')
          .mockImplementationOnce(() => {
            return '/abc?tgWebAppStartParam=location_hash#tgWebAppPlatform=tdesktop&tgWebAppVersion=7.0&tgWebAppThemeParams=%7B%7D&tgWebAppData=user%3D%257B%2522id%2522%253A279058397%252C%2522first_name%2522%253A%2522Vladislav%2522%252C%2522last_name%2522%253A%2522Kibenko%2522%252C%2522username%2522%253A%2522vdkfrost%2522%252C%2522language_code%2522%253A%2522ru%2522%252C%2522is_premium%2522%253Atrue%252C%2522allows_write_to_pm%2522%253Atrue%252C%2522photo_url%2522%253A%2522https%253A%255C%252F%255C%252Ft.me%255C%252Fi%255C%252Fuserpic%255C%252F320%255C%252F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%2522%257D%26chat_instance%3D-9019086117643313246%26chat_type%3Dsender%26auth_date%3D1736409902%26signature%3DFNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA%26hash%3D4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d90';
          });
        expect(retrieveRawInitData()).toBe(
          'user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%22%7D&chat_instance=-9019086117643313246&chat_type=sender&auth_date=1736409902&signature=FNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA&hash=4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d90',
        );
      },
    );
  });

  describe('first navigation entry contains init data', () => {
    it(
      'should retrieve init data from the window.performance. Throw an error if data is invalid or missing',
      () => {
        vi
          .spyOn(performance, 'getEntriesByType')
          .mockImplementationOnce(() => [{
            name: '/abc?tgWebAppStartParam=performance#tgWebAppPlatform=macos&tgWebAppVersion=7.3&tgWebAppThemeParams=%7B%7D&tgWebAppData=user%3D%257B%2522id%2522%253A279058397%252C%2522first_name%2522%253A%2522Vladislav%2522%252C%2522last_name%2522%253A%2522Kibenko%2522%252C%2522username%2522%253A%2522vdkfrost%2522%252C%2522language_code%2522%253A%2522ru%2522%252C%2522is_premium%2522%253Atrue%252C%2522allows_write_to_pm%2522%253Atrue%252C%2522photo_url%2522%253A%2522https%253A%255C%252F%255C%252Ft.me%255C%252Fi%255C%252Fuserpic%255C%252F320%255C%252F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%2522%257D%26chat_instance%3D-9019086117643313246%26chat_type%3Dsender%26auth_date%3D1736409902%26signature%3DFNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA%26hash%3D4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d33',
          }] as any);

        expect(retrieveRawInitData()).toBe(
          'user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%22%7D&chat_instance=-9019086117643313246&chat_type=sender&auth_date=1736409902&signature=FNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA&hash=4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d33',
        );
      },
    );
  });

  describe('session storage contains init data', () => {
    it(
      'should return launch parameters from the session storage tapps/launchParams key. If data is missing or invalid, throw an error',
      () => {
        const spy = vi
          .spyOn(sessionStorage, 'getItem')
          .mockImplementationOnce(() => '');
        expect(() => retrieveRawInitData()).toThrow();

        spy.mockClear();
        spy.mockImplementationOnce(() => {
          return '"tgWebAppPlatform=android&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23ffffff%22%7D&tgWebAppVersion=7.5&tgWebAppData=user%3D%257B%2522id%2522%253A279058397%252C%2522first_name%2522%253A%2522Vladislav%2522%252C%2522last_name%2522%253A%2522Kibenko%2522%252C%2522username%2522%253A%2522vdkfrost%2522%252C%2522language_code%2522%253A%2522ru%2522%252C%2522is_premium%2522%253Atrue%252C%2522allows_write_to_pm%2522%253Atrue%252C%2522photo_url%2522%253A%2522https%253A%255C%252F%255C%252Ft.me%255C%252Fi%255C%252Fuserpic%255C%252F320%255C%252F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%2522%257D%26chat_instance%3D-9019086117643313246%26chat_type%3Dsender%26auth_date%3D1736409902%26signature%3DFNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA%26hash%3D4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d90"';
        });
        expect(retrieveRawInitData()).toBe(
          'user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%22%7D&chat_instance=-9019086117643313246&chat_type=sender&auth_date=1736409902&signature=FNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA&hash=4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d90',
        );
      },
    );
  });
});

describe('retrieveRawInitDataFp', () => {
  describe('window.location.href contains init data', () => {
    it(
      'should retrieve init data from the window.location.href. Throw an error if data is invalid or missing',
      () => {
        vi
          .spyOn(window.location, 'href', 'get')
          .mockImplementationOnce(() => {
            return '/abc?tgWebAppStartParam=location_hash#tgWebAppPlatform=tdesktop&tgWebAppVersion=7.0&tgWebAppThemeParams=%7B%7D&tgWebAppData=user%3D%257B%2522id%2522%253A279058397%252C%2522first_name%2522%253A%2522Vladislav%2522%252C%2522last_name%2522%253A%2522Kibenko%2522%252C%2522username%2522%253A%2522vdkfrost%2522%252C%2522language_code%2522%253A%2522ru%2522%252C%2522is_premium%2522%253Atrue%252C%2522allows_write_to_pm%2522%253Atrue%252C%2522photo_url%2522%253A%2522https%253A%255C%252F%255C%252Ft.me%255C%252Fi%255C%252Fuserpic%255C%252F320%255C%252F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%2522%257D%26chat_instance%3D-9019086117643313246%26chat_type%3Dsender%26auth_date%3D1736409902%26signature%3DFNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA%26hash%3D4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d90';
          });
        expect(retrieveRawInitDataFp()).toStrictEqual(E.right(
          O.some(
            'user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%22%7D&chat_instance=-9019086117643313246&chat_type=sender&auth_date=1736409902&signature=FNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA&hash=4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d90',
          ),
        ));
      },
    );
  });

  describe('first navigation entry contains init data', () => {
    it(
      'should retrieve init data from the window.performance. Throw an error if data is invalid or missing',
      () => {
        vi
          .spyOn(performance, 'getEntriesByType')
          .mockImplementationOnce(() => [{
            name: '/abc?tgWebAppStartParam=performance#tgWebAppPlatform=macos&tgWebAppVersion=7.3&tgWebAppThemeParams=%7B%7D&tgWebAppData=user%3D%257B%2522id%2522%253A279058397%252C%2522first_name%2522%253A%2522Vladislav%2522%252C%2522last_name%2522%253A%2522Kibenko%2522%252C%2522username%2522%253A%2522vdkfrost%2522%252C%2522language_code%2522%253A%2522ru%2522%252C%2522is_premium%2522%253Atrue%252C%2522allows_write_to_pm%2522%253Atrue%252C%2522photo_url%2522%253A%2522https%253A%255C%252F%255C%252Ft.me%255C%252Fi%255C%252Fuserpic%255C%252F320%255C%252F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%2522%257D%26chat_instance%3D-9019086117643313246%26chat_type%3Dsender%26auth_date%3D1736409902%26signature%3DFNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA%26hash%3D4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d33',
          }] as any);

        expect(retrieveRawInitDataFp()).toStrictEqual(E.right(
          O.some(
            'user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%22%7D&chat_instance=-9019086117643313246&chat_type=sender&auth_date=1736409902&signature=FNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA&hash=4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d33',
          ),
        ));
      },
    );
  });

  describe('session storage contains init data', () => {
    it(
      'should return launch parameters from the session storage tapps/launchParams key. If data is missing or invalid, throw an error',
      () => {
        const spy = vi
          .spyOn(sessionStorage, 'getItem')
          .mockImplementationOnce(() => '');
        expect(retrieveRawInitDataFp()).toMatchObject(E.left(expect.anything()));

        spy.mockClear();
        spy.mockImplementationOnce(() => {
          return '"tgWebAppPlatform=android&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23ffffff%22%7D&tgWebAppVersion=7.5&tgWebAppData=user%3D%257B%2522id%2522%253A279058397%252C%2522first_name%2522%253A%2522Vladislav%2522%252C%2522last_name%2522%253A%2522Kibenko%2522%252C%2522username%2522%253A%2522vdkfrost%2522%252C%2522language_code%2522%253A%2522ru%2522%252C%2522is_premium%2522%253Atrue%252C%2522allows_write_to_pm%2522%253Atrue%252C%2522photo_url%2522%253A%2522https%253A%255C%252F%255C%252Ft.me%255C%252Fi%255C%252Fuserpic%255C%252F320%255C%252F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%2522%257D%26chat_instance%3D-9019086117643313246%26chat_type%3Dsender%26auth_date%3D1736409902%26signature%3DFNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA%26hash%3D4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d90"';
        });
        expect(retrieveRawInitDataFp()).toStrictEqual(E.right(
          O.some('user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%22%7D&chat_instance=-9019086117643313246&chat_type=sender&auth_date=1736409902&signature=FNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA&hash=4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d90'),
        ));
      },
    );
  });
});

describe('retrieveRawLaunchParams', () => {
  describe('window.location.href contains launch params', () => {
    it(
      'should retrieve launch params from the window.location.href. Throw an error if data is invalid or missing',
      () => {
        vi
          .spyOn(window.location, 'href', 'get')
          .mockImplementationOnce(() => {
            return '/abc?tgWebAppStartParam=location_hash#tgWebAppPlatform=tdesktop&tgWebAppVersion=7.0&tgWebAppThemeParams=%7B%7D';
          });

        expect(retrieveRawLaunchParams())
          .toBe(
            'tgWebAppStartParam=location_hash&tgWebAppPlatform=tdesktop&tgWebAppVersion=7.0&tgWebAppThemeParams=%7B%7D',
          );
      },
    );
  });

  describe('first navigation entry contains launch params', () => {
    it(
      'should retrieve launch params from the window.performance. Throw an error if data is invalid or missing',
      () => {
        vi
          .spyOn(performance, 'getEntriesByType')
          .mockImplementationOnce(() => [{
            name: '/abc?tgWebAppStartParam=performance#tgWebAppPlatform=macos&tgWebAppVersion=7.3&tgWebAppThemeParams=%7B%7D',
          }] as any);

        expect(retrieveRawLaunchParams())
          .toBe(
            'tgWebAppStartParam=performance&tgWebAppPlatform=macos&tgWebAppVersion=7.3&tgWebAppThemeParams=%7B%7D',
          );
      },
    );
  });

  describe('session storage contains launch params', () => {
    it(
      'should return launch parameters from the session storage tapps/launchParams key. If data is missing or invalid, throw an error',
      () => {
        const spy = vi
          .spyOn(sessionStorage, 'getItem')
          .mockImplementationOnce(() => '');
        expect(() => retrieveRawLaunchParams()).toThrow();

        spy.mockClear();
        spy.mockImplementationOnce(() => {
          return '"tgWebAppPlatform=android&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23ffffff%22%7D&tgWebAppVersion=7.5"';
        });
        expect(retrieveRawLaunchParams())
          .toBe(
            'tgWebAppPlatform=android&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23ffffff%22%7D&tgWebAppVersion=7.5',
          );
      },
    );
  });
});

describe('retrieveRawLaunchParamsFp', () => {
  describe('window.location.href contains launch params', () => {
    it(
      'should retrieve launch params from the window.location.href. Throw an error if data is invalid or missing',
      () => {
        vi
          .spyOn(window.location, 'href', 'get')
          .mockImplementationOnce(() => {
            return '/abc?tgWebAppStartParam=location_hash#tgWebAppPlatform=tdesktop&tgWebAppVersion=7.0&tgWebAppThemeParams=%7B%7D';
          });

        expect(retrieveRawLaunchParamsFp()).toStrictEqual(E.right(
          'tgWebAppStartParam=location_hash&tgWebAppPlatform=tdesktop&tgWebAppVersion=7.0&tgWebAppThemeParams=%7B%7D',
        ));
      },
    );
  });

  describe('first navigation entry contains launch params', () => {
    it(
      'should retrieve launch params from the window.performance. Throw an error if data is invalid or missing',
      () => {
        vi
          .spyOn(performance, 'getEntriesByType')
          .mockImplementationOnce(() => [{
            name: '/abc?tgWebAppStartParam=performance#tgWebAppPlatform=macos&tgWebAppVersion=7.3&tgWebAppThemeParams=%7B%7D',
          }] as any);

        expect(retrieveRawLaunchParamsFp()).toStrictEqual(E.right(
          'tgWebAppStartParam=performance&tgWebAppPlatform=macos&tgWebAppVersion=7.3&tgWebAppThemeParams=%7B%7D',
        ));
      },
    );
  });

  describe('session storage contains launch params', () => {
    it(
      'should return launch parameters from the session storage tapps/launchParams key. If data is missing or invalid, throw an error',
      () => {
        const spy = vi
          .spyOn(sessionStorage, 'getItem')
          .mockImplementationOnce(() => '');
        expect(retrieveRawLaunchParamsFp()).toMatchObject(E.left(expect.anything()));

        spy.mockClear();
        spy.mockImplementationOnce(() => {
          return '"tgWebAppPlatform=android&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23ffffff%22%7D&tgWebAppVersion=7.5"';
        });
        expect(retrieveRawLaunchParamsFp()).toStrictEqual(E.right(
          'tgWebAppPlatform=android&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23ffffff%22%7D&tgWebAppVersion=7.5',
        ));
      },
    );
  });
});
