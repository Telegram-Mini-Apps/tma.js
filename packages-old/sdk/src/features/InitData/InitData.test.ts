import { either as E, option as O } from 'fp-ts';
import { describe, expect, it } from 'vitest';

import { InitData, InitDataOptions } from '@/features/InitData/InitData.js';

function instantiate({
  retrieveInitData = () => E.left(O.none),
}: Partial<InitDataOptions<any>> = {}) {
  return new InitData({ retrieveInitData });
}

describe('restore', () => {
  it('should set state based on init data from launch params', () => {
    const initData = {
      auth_date: new Date(1736409902000),
      chat_instance: '-9019086117643313246',
      chat_type: 'sender',
      hash: '4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d90',
      signature: 'FNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA',
      user: {
        allows_write_to_pm: true,
        first_name: 'Vladislav',
        id: 279058397,
        is_premium: true,
        language_code: 'ru',
        last_name: 'Kibenko',
        photo_url: 'https://t.me/i/userpic/320/4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg',
        username: 'vdkfrost',
      },
    };
    const rawInitData = 'user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%22%7D&chat_instance=-9019086117643313246&chat_type=sender&auth_date=1736409902&signature=FNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA&hash=4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d90';
    const component = instantiate({
      retrieveInitData: () => E.right(O.some({
        raw: rawInitData,
        obj: initData,
      })),
    });
    component.restore();

    expect(component.authDate()).toStrictEqual(new Date(1736409902000));
    expect(component.chatInstance()).toBe('-9019086117643313246');
    expect(component.chatType()).toBe('sender');
    expect(component.hash())
      .toBe('4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d90');
    expect(component.signature())
      .toBe('FNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA');
    expect(component.user()).toStrictEqual({
      allows_write_to_pm: true,
      first_name: 'Vladislav',
      id: 279058397,
      is_premium: true,
      language_code: 'ru',
      last_name: 'Kibenko',
      photo_url: 'https://t.me/i/userpic/320/4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg',
      username: 'vdkfrost',
    });
    expect(component.raw()).toBe(rawInitData);
    expect(component.state()).toStrictEqual(initData);
  });
});
