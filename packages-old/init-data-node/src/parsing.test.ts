import { describe, expect, it } from 'vitest';

import { parse, parseFp } from './parsing.js';

describe('parse', () => {
  it('should properly create object from query', () => {
    expect(
      parse('user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%22%7D&chat_instance=-9019086117643313246&chat_type=sender&auth_date=1736362318&signature=JUPYm_qmf8hJYSux535eNDg_a5ZdcOkS6yZMkEUGS09zcXoIopCn3DOuNCa5aWH0PQGaUGGMAaq9MeaMg-6EBg&hash=14cd9c9eeebf82370b20f4df23af9439d00f6da2837dd20e17ed3b03ab99cd9c&additional_prop=1'),
    ).toStrictEqual({
      auth_date: new Date(1736362318000),
      chat_instance: '-9019086117643313246',
      chat_type: 'sender',
      hash: '14cd9c9eeebf82370b20f4df23af9439d00f6da2837dd20e17ed3b03ab99cd9c',
      signature: 'JUPYm_qmf8hJYSux535eNDg_a5ZdcOkS6yZMkEUGS09zcXoIopCn3DOuNCa5aWH0PQGaUGGMAaq9MeaMg-6EBg',
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
      additional_prop: '1',
    });
  });
});

describe('parseFp', () => {
  it('should properly create object from query', () => {
    expect(
      parseFp('user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%22%7D&chat_instance=-9019086117643313246&chat_type=sender&auth_date=1736362318&signature=JUPYm_qmf8hJYSux535eNDg_a5ZdcOkS6yZMkEUGS09zcXoIopCn3DOuNCa5aWH0PQGaUGGMAaq9MeaMg-6EBg&hash=14cd9c9eeebf82370b20f4df23af9439d00f6da2837dd20e17ed3b03ab99cd9c&additional_prop=1'),
    ).toMatchObject({
      right: {
        auth_date: new Date(1736362318000),
        chat_instance: '-9019086117643313246',
        chat_type: 'sender',
        hash: '14cd9c9eeebf82370b20f4df23af9439d00f6da2837dd20e17ed3b03ab99cd9c',
        signature: 'JUPYm_qmf8hJYSux535eNDg_a5ZdcOkS6yZMkEUGS09zcXoIopCn3DOuNCa5aWH0PQGaUGGMAaq9MeaMg-6EBg',
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
        additional_prop: '1',
      },
    });
  });
});
