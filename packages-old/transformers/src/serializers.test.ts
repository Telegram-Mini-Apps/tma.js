import { describe, expect, it } from 'vitest';

import { serializeInitDataQuery, serializeLaunchParamsQuery } from './serializers.js';

describe('serializeInitDataQuery', () => {
  it('should properly serialize the value', () => {
    expect(
      serializeInitDataQuery({
        auth_date: new Date(1000),
        hash: 'Hash',
        signature: 'Signature',
        user: {
          id: 1,
          first_name: 'Pavel',
        },
        chat_instance: '-293',
        chat_type: 'group',
        chat: {
          id: 3,
          username: 'pavel',
          title: 'Some title',
          photo_url: '',
          type: 'self',
        },
        can_send_after: 911,
        query_id: 'QueryID',
        receiver: {
          id: 2,
          first_name: 'Pavel Buddy',
        },
        start_param: 'StartParam',
        additional_prop: 'PROP',
        prop1: ['a', 'b'],
      }),
    ).toBe('auth_date=1&hash=Hash&signature=Signature&user=%7B%22id%22%3A1%2C%22first_name%22%3A%22Pavel%22%7D&chat_instance=-293&chat_type=group&chat=%7B%22id%22%3A3%2C%22username%22%3A%22pavel%22%2C%22title%22%3A%22Some+title%22%2C%22photo_url%22%3A%22%22%2C%22type%22%3A%22self%22%7D&can_send_after=911&query_id=QueryID&receiver=%7B%22id%22%3A2%2C%22first_name%22%3A%22Pavel+Buddy%22%7D&start_param=StartParam&additional_prop=PROP&prop1=a&prop1=b');
  });
});

describe('serializeLaunchParamsQuery', () => {
  it('should properly serialize the value', () => {
    expect(serializeLaunchParamsQuery({
      tgWebAppData: {
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
      },
      tgWebAppVersion: '8.0',
      tgWebAppPlatform: 'tdesktop',
      tgWebAppThemeParams: {
        accent_text_color: '#6ab3f2',
        bg_color: '#17212b',
        bottom_bar_bg_color: '#17212b',
        button_color: '#5289c1',
        button_text_color: '#ffffff',
        destructive_text_color: '#ec3942',
        header_bg_color: '#17212b',
        hint_color: '#708599',
        link_color: '#6ab3f3',
        secondary_bg_color: '#232e3c',
        section_bg_color: '#17212b',
        section_header_text_color: '#6ab3f3',
        section_separator_color: '#111921',
        subtitle_text_color: '#708599',
        text_color: '#f5f5f5',
      },
      tgWebAppBotInline: false,
      tgWebAppDefaultColors: {},
      tgWebAppFullscreen: false,
      tgWebAppShowSettings: false,
    }))
      .toBe('tgWebAppData=auth_date%3D1736409902%26chat_instance%3D-9019086117643313246%26chat_type%3Dsender%26hash%3D4c710b1d446dd4fd301c0efbf7c31627eca193a2e657754c9e0612cb1eb71d90%26signature%3DFNWSy6kv5n4kkmYYmfTbrgRtswTvwXgHTRWBVjp-YOv2srtMFSYCWZ9nGr_PohWZeWcooFo_oQgsnTJge3JdBA%26user%3D%257B%2522allows_write_to_pm%2522%253Atrue%252C%2522first_name%2522%253A%2522Vladislav%2522%252C%2522id%2522%253A279058397%252C%2522is_premium%2522%253Atrue%252C%2522language_code%2522%253A%2522ru%2522%252C%2522last_name%2522%253A%2522Kibenko%2522%252C%2522photo_url%2522%253A%2522https%253A%252F%252Ft.me%252Fi%252Fuserpic%252F320%252F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%2522%252C%2522username%2522%253A%2522vdkfrost%2522%257D&tgWebAppVersion=8.0&tgWebAppPlatform=tdesktop&tgWebAppThemeParams=%7B%22accent_text_color%22%3A%22%236ab3f2%22%2C%22bg_color%22%3A%22%2317212b%22%2C%22bottom_bar_bg_color%22%3A%22%2317212b%22%2C%22button_color%22%3A%22%235289c1%22%2C%22button_text_color%22%3A%22%23ffffff%22%2C%22destructive_text_color%22%3A%22%23ec3942%22%2C%22header_bg_color%22%3A%22%2317212b%22%2C%22hint_color%22%3A%22%23708599%22%2C%22link_color%22%3A%22%236ab3f3%22%2C%22secondary_bg_color%22%3A%22%23232e3c%22%2C%22section_bg_color%22%3A%22%2317212b%22%2C%22section_header_text_color%22%3A%22%236ab3f3%22%2C%22section_separator_color%22%3A%22%23111921%22%2C%22subtitle_text_color%22%3A%22%23708599%22%2C%22text_color%22%3A%22%23f5f5f5%22%7D&tgWebAppBotInline=0&tgWebAppDefaultColors=%7B%7D&tgWebAppFullscreen=0&tgWebAppShowSettings=0');
  });
});
