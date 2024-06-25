# @telegram-apps/init-data-node

<p style="display: flex; gap: 8px; min-height: 20px">
  <a href="https://npmjs.com/package/@telegram-apps/init-data-node">
    <img src="https://img.shields.io/npm/v/@telegram-apps/init-data-node?logo=npm"/>
  </a>
  <img src="https://img.shields.io/bundlephobia/minzip/@telegram-apps/init-data-node"/>
  <a href="https://github.com/Telegram-Mini-Apps/telegram-apps/tree/master/packages/init-data-node">
    <img src="https://img.shields.io/badge/source-black?logo=github"/>
  </a>
</p>

The package provides utilities to work with the initialization data of Telegram Mini Apps on the
server side. To learn more about the initialization data and its usage, please refer to
the [documentation](../platform/launch-parameters.md).

## Installation

::: code-group

```bash [pnpm]
pnpm i @telegram-apps/init-data-node
```

```bash [npm]
npm i @telegram-apps/init-data-node
```

```bash [yarn]
yarn add @telegram-apps/init-data-node
```

:::

## Parsing

You can learn more about parsing utilities in [@telegram-apps/sdk](telegram-apps-sdk/init-data.md#parsing)
documentation. This package re-exports the `parseInitData` function as `parse`.

## Validating

To validate the signature of the initialization data, the `validate` function is used. It expects
the initialization data to be passed in a raw format (search parameters) and throws an error in
certain cases.

```typescript
import { validate } from '@telegram-apps/init-data-node';

const secretToken = '5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8';
const initData =
  'query_id=AAHdF6IQAAAAAN0XohDhrOrc' +
  '&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%7D' +
  '&auth_date=1662771648' +
  '&hash=c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2';

validate(initData, secretToken);
```

Function will throw an error in one of these cases:

- `auth_date` should present integer
- `auth_date` is empty or not found
- `hash` is empty or not found
- Signature is invalid
- Init data expired

By default, the function checks the expiration of the initialization data. The default expiration
duration is set to 1 day (86,400 seconds). It is recommended to always check the expiration of the
initialization data, as it could be stolen but still remain valid. To disable this feature,
pass `{ expiresIn: 0 }` as the third argument.

## Signing

There could be some cases when a developer needs to create their own init data. For instance,
Telegram does not send this data automatically if you are using something like `KeyboardButton`
or `InlineKeyboardButton`. Telegram cannot do this because it doesn't know which Telegram Bot token
should be used.

To implement such a process, it is required to use the `sign` method. Here is the complete example:

::: code-group

```ts [Signing]
import { sign } from '@telegram-apps/init-data-node';

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
);
```

```ts [Expected result]
'auth_date=1' +
'&can_send_after=10000' +
'&chat=%7B%22id%22%3A1%2C%22type%22%3A%22group%22%2C%22title%22%3A%22chat-title%22%2C%22photo_url%22%3A%22group%22%2C%22username%22%3A%22my-chat%22%7D' +
'&chat_instance=888' +
'&chat_type=sender' +
'&query_id=QUERY' +
'&receiver=%7B%22added_to_attachment_menu%22%3Afalse%2C%22allows_write_to_pm%22%3Atrue%2C%22first_name%22%3A%22receiver-first-name%22%2C%22id%22%3A991%2C%22is_bot%22%3Afalse%2C%22is_premium%22%3Atrue%2C%22language_code%22%3A%22ru%22%2C%22last_name%22%3A%22receiver-last-name%22%2C%22photo_url%22%3A%22receiver-photo%22%2C%22username%22%3A%22receiver-username%22%7D' +
'&start_param=debug' +
'&user=%7B%22added_to_attachment_menu%22%3Afalse%2C%22allows_write_to_pm%22%3Afalse%2C%22first_name%22%3A%22user-first-name%22%2C%22id%22%3A222%2C%22is_bot%22%3Atrue%2C%22is_premium%22%3Afalse%2C%22language_code%22%3A%22en%22%2C%22last_name%22%3A%22user-last-name%22%2C%22photo_url%22%3A%22user-photo%22%2C%22username%22%3A%22user-username%22%7D' +
'&hash=47cfa22e72b887cba90c9cb833c5ea0f599975b6ce7193741844b5c4a4228b40'
```

:::

This function accepts three arguments:

- **Data to sign**: It represents a parsed [init data](telegram-apps-sdk/init-data/init-data.md) object
  excluding the `authDate` and `hash` properties.
- **Bot token**: This token is received from [@BotFather](https://t.me/botfather).
- **Signing date**: This value will be used as the value of the `authDate` property.

As a result, the function returns signed init data.

## Web Crypto API

If this package is used in an environment other than Node.js, a developer can use the `web`
subdirectory, which exports the same methods as described above but returns promises.

```ts
import { validate, sign, signData } from '@telegram-apps/init-data-node/web';

await validate(...);
await sign(...);
await signData(...);
```
