import { describe, expect, it } from 'vitest';
import type { InitDataParsed } from '@telegram-apps/sdk';

import { validate, sign, signData } from './node';

const sp = 'auth_date=1&can_send_after=10000&chat=%7B%22id%22%3A1%2C%22type%22%3A%22group%22%2C%22title%22%3A%22chat-title%22%2C%22photo_url%22%3A%22group%22%2C%22username%22%3A%22my-chat%22%7D&chat_instance=888&chat_type=sender&hash=47cfa22e72b887cba90c9cb833c5ea0f599975b6ce7193741844b5c4a4228b40&query_id=QUERY&receiver=%7B%22added_to_attachment_menu%22%3Afalse%2C%22allows_write_to_pm%22%3Atrue%2C%22first_name%22%3A%22receiver-first-name%22%2C%22id%22%3A991%2C%22is_bot%22%3Afalse%2C%22is_premium%22%3Atrue%2C%22language_code%22%3A%22ru%22%2C%22last_name%22%3A%22receiver-last-name%22%2C%22photo_url%22%3A%22receiver-photo%22%2C%22username%22%3A%22receiver-username%22%7D&start_param=debug&user=%7B%22added_to_attachment_menu%22%3Afalse%2C%22allows_write_to_pm%22%3Afalse%2C%22first_name%22%3A%22user-first-name%22%2C%22id%22%3A222%2C%22is_bot%22%3Atrue%2C%22is_premium%22%3Afalse%2C%22language_code%22%3A%22en%22%2C%22last_name%22%3A%22user-last-name%22%2C%22photo_url%22%3A%22user-photo%22%2C%22username%22%3A%22user-username%22%7D';

const secretToken = '5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8';

const initData: InitDataParsed = {
  authDate: new Date(1000),
  canSendAfter: 10000,
  chat: {
    id: 1,
    type: 'group',
    username: 'my-chat',
    title: 'chat-title',
    photoUrl: 'chat-photo',
  },
  chatInstance: '888',
  chatType: 'sender',
  hash: '47cfa22e72b887cba90c9cb833c5ea0f599975b6ce7193741844b5c4a4228b40',
  queryId: 'QUERY',
  receiver: {
    addedToAttachmentMenu: false,
    allowsWriteToPm: true,
    firstName: 'receiver-first-name',
    id: 991,
    isBot: false,
    isPremium: true,
    languageCode: 'ru',
    lastName: 'receiver-last-name',
    photoUrl: 'receiver-photo',
    username: 'receiver-username',
  },
  startParam: 'debug',
  user: {
    addedToAttachmentMenu: false,
    allowsWriteToPm: false,
    firstName: 'user-first-name',
    id: 222,
    isBot: true,
    isPremium: false,
    languageCode: 'en',
    lastName: 'user-last-name',
    photoUrl: 'user-photo',
    username: 'user-username',
  },
};

describe('validate', () => {
  it('should throw missing hash error in case, it is not in search params', () => {
    expect(() => validate('auth_date=1', secretToken))
      .toThrowError('"hash" is empty or not found');
  });

  it('should throw an error on case, auth_date is not passed or does not represent integer', () => {
     expect(() => validate('hash=HHH', secretToken))
       .toThrowError('"auth_date" is empty or not found');
     expect(() => validate('auth_date=AAA&hash=HHH', secretToken))
       .toThrowError('"auth_date" should present integer');
  });

  it('should throw an error in case, parameters are expired', () => {
     expect(() => validate(sp, secretToken, { expiresIn: 1 }))
       .toThrowError('Init data expired');
     expect(() => validate(initData, secretToken, { expiresIn: 1 }))
       .toThrowError('Init data expired');
  });

  it('should throw an error in case, sign is invalid', () => {
     expect(() => validate(sp, `${secretToken}A`, { expiresIn: 0 }))
      .toThrowError('Signature is invalid');
     expect(() => validate(initData, `${secretToken}A`, { expiresIn: 0 }))
      .toThrowError('Signature is invalid');
  });

  it('should correctly validate parameters in case, they are valid', () => {
     expect(() => validate(sp, secretToken, { expiresIn: 0 }))
       .not
       .toThrow()
     expect(() => validate(initData, secretToken, { expiresIn: 0 }))
       .not
       .toThrow()
     expect(() => validate(new URLSearchParams(sp), secretToken, { expiresIn: 0 }))
       .not
       .toThrow()
  });

  it('should throw an error in case, expiration time is not passed, parameters were created more than 1 day ago and already expired', () => {
     expect(() => validate(sp, secretToken)).toThrow('Init data expired');
  });
});

describe('sign', () => {
  it('should correctly sign data', () => {
    expect(
      sign(
        {
          canSendAfter: 10000,
          chat: {
            id: 1,
            type: 'group',
            username: 'my-chat',
            title: 'chat-title',
            photoUrl: 'chat-photo',
          },
          chatInstance: '888',
          chatType: 'sender',
          queryId: 'QUERY',
          receiver: {
            addedToAttachmentMenu: false,
            allowsWriteToPm: true,
            firstName: 'receiver-first-name',
            id: 991,
            isBot: false,
            isPremium: true,
            languageCode: 'ru',
            lastName: 'receiver-last-name',
            photoUrl: 'receiver-photo',
            username: 'receiver-username',
          },
          startParam: 'debug',
          user: {
            addedToAttachmentMenu: false,
            allowsWriteToPm: false,
            firstName: 'user-first-name',
            id: 222,
            isBot: true,
            isPremium: false,
            languageCode: 'en',
            lastName: 'user-last-name',
            photoUrl: 'user-photo',
            username: 'user-username',
          },
        },
        '5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8',
        new Date(1000),
      ),
    ).toBe('auth_date=1&can_send_after=10000&chat=%7B%22id%22%3A1%2C%22type%22%3A%22group%22%2C%22title%22%3A%22chat-title%22%2C%22photo_url%22%3A%22group%22%2C%22username%22%3A%22my-chat%22%7D&chat_instance=888&chat_type=sender&query_id=QUERY&receiver=%7B%22added_to_attachment_menu%22%3Afalse%2C%22allows_write_to_pm%22%3Atrue%2C%22first_name%22%3A%22receiver-first-name%22%2C%22id%22%3A991%2C%22is_bot%22%3Afalse%2C%22is_premium%22%3Atrue%2C%22language_code%22%3A%22ru%22%2C%22last_name%22%3A%22receiver-last-name%22%2C%22photo_url%22%3A%22receiver-photo%22%2C%22username%22%3A%22receiver-username%22%7D&start_param=debug&user=%7B%22added_to_attachment_menu%22%3Afalse%2C%22allows_write_to_pm%22%3Afalse%2C%22first_name%22%3A%22user-first-name%22%2C%22id%22%3A222%2C%22is_bot%22%3Atrue%2C%22is_premium%22%3Afalse%2C%22language_code%22%3A%22en%22%2C%22last_name%22%3A%22user-last-name%22%2C%22photo_url%22%3A%22user-photo%22%2C%22username%22%3A%22user-username%22%7D&hash=47cfa22e72b887cba90c9cb833c5ea0f599975b6ce7193741844b5c4a4228b40');
  });
});

describe('signData', () => {
  it('should use HMAC-SHA256 algorithm with key, based on HMAC-SHA256 keyed with the "WebAppData" value, applied to the secret token', () => {
    expect(signData('abc', 'my-secret-token'))
      .toBe('6ecc2e9b51f30dde6877ce374ede54eb626c84e78a5d9a9dcac54d2d248f6bde');
  });
})
