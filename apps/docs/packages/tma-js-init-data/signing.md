# Signing

There could be some cases when a developer needs to create their own init data. For instance,
Telegram does not send this data automatically if you are using something like `KeyboardButton`
or `InlineKeyboardButton`. Telegram cannot do this because it doesn't know which Telegram Bot token
should be used. Signing is also useful to test the server or to mock the Telegram environment.

## Signing Init Data

To sign init data, use the `sign` function. It accepts the init data to sign and the bot token,
and returns signed init data in the query format:

```ts
import { sign } from '@tma.js/init-data';

const rawInitData = await sign(
  {
    query_id: 'AAHdF6IQAAAAAN0XohDhrOrc',
    user: {
      id: 279058397,
      first_name: 'Vladislav',
      last_name: 'Kibenko',
      username: 'vdkfrost',
      language_code: 'ru',
      is_premium: true,
    },
    auth_date: new Date(1662771648000),
  },
  // Bot secret token.
  '5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8',
);
// 'query_id=AAHdF6IQAAAAAN0XohDhrOrc' +
// '&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%7D' +
// '&auth_date=1662771648' +
// '&hash=c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2'
```

The function accepts two arguments:

- **Data to sign**: an object of the `SignableInitData` type. It has the same shape as
  the parsed [`InitData`](./parsing.md#parsed-data) object, but without the `hash` property, which
  is computed by the function. All properties are optional:
  - `auth_date` is the init data creation date. If omitted, the current date is used.
  - `signature` is added to the result only if passed. It can't be computed, as it requires
    the Telegram private key.
- **Secret**: the bot token received from [@BotFather](https://t.me/botfather), or the secret key
  created with [`createSecretKey`](#using-secret-key).

Properties equal to `undefined` are skipped. The `hash` parameter is always the last one in the
result.

## Using Secret Key

Each call accepting the bot token derives a secret key from it. To do it once, create the secret
key using `createSecretKey` and pass it instead of the token:

```ts
import { createSecretKey, sign } from '@tma.js/init-data';

const secretKey = await createSecretKey(botToken);

await sign({ user: { id: 1, first_name: 'Pavel' } }, secretKey);
```

The secret key can also be created from the bot token hash instead of the raw token. By the hash,
we mean the bot token signed using HMAC-SHA-256 with the `WebAppData` key, as specified in
the [validation](../../platform/init-data.md#validating) section of the documentation. Use
the `hashToken` function to compute it:

```ts
import { createSecretKey, hashToken, sign } from '@tma.js/init-data';

await hashToken('5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8');
// 'a5c609aa52f63cb5e6d8ceb6e4138726ea82bbc36bb786d64482d445ea38ee5f'

const secretKey = await createSecretKey(
  'a5c609aa52f63cb5e6d8ceb6e4138726ea82bbc36bb786d64482d445ea38ee5f',
  { hashed: true },
);

await sign({ user: { id: 1, first_name: 'Pavel' } }, secretKey);
```

You can use this approach to reduce the number of places where the raw token is stored. Learn more
in the [Validating](./validating.md#secret-key) section.

## Signing Arbitrary Data

To sign an arbitrary string the way Telegram signs init data, use the `signData` function. It
returns the signature in the hex format. For example, this is how to sign a data-check-string
created as described in the [platform documentation](../../platform/init-data.md#using-telegram-bot-token):

```ts
import { signData } from '@tma.js/init-data';

await signData(
  'auth_date=1662771648\n' +
  'query_id=AAHdF6IQAAAAAN0XohDhrOrc\n' +
  'user={"id":279058397,"first_name":"Vladislav","last_name":"Kibenko","username":"vdkfrost","language_code":"ru","is_premium":true}',
  // Bot token or a secret key.
  '5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8',
);
// 'c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2'
```

## Mocking Environment

Signed init data can be used to develop the mini app outside Telegram. Pass it to
the `mockTelegramEnv` function of [@tma.js/bridge](../tma-js-bridge.md) (or
[@tma.js/sdk](../tma-js-sdk.md)) as the `tgWebAppData` launch parameter. Note that signing requires
the bot token, so do it on the server or in a development-only script, and never ship the bot token
to the client.

```ts
import { mockTelegramEnv } from '@tma.js/bridge';

mockTelegramEnv({
  launchParams: {
    tgWebAppPlatform: 'tdesktop',
    tgWebAppVersion: '9.0',
    tgWebAppThemeParams: {},
    // Init data signed on the server with the sign function.
    tgWebAppData: signedInitData,
  },
});
```
