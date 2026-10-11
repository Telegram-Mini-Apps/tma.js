# Signing

There could be some cases when a developer needs to create their own init data. For instance,
Telegram does not send this data automatically if you are using something like `KeyboardButton`
or `InlineKeyboardButton`. Telegram cannot do this because it doesn't know which Telegram Bot token
should be used.

The package provides utilities for both Node.js and non-Node.js environments. Node.js utilities are imported from
the root of the package. Web Crypto API (non-Node.js environments) utilities are imported from the `web` subdirectory,
these functions are all async due to the Web Crypto API nature.

:::code-group

```typescript [Node.js]
import { sign } from '@tma.js/init-data-node';

sign({ ... }, '...', new Date());
```

```typescript [Web Crypto API]
import { sign } from '@tma.js/init-data-node/web';

await sign({ ... }, '...', new Date());
```

:::

To implement signing process, it is required to use the `sign` method. Here is the complete example:

::: code-group

```ts [Node.js]
import { sign } from '@tma.js/init-data-node';

sign(
  {
    can_send_after: 10000,
    chat: {
      id: 1,
      type: 'group',
      username: 'my-chat',
      title: 'chat-title',
      photo_url: 'chat-photo',
    },
    chat_instance: '888',
    chat_type: 'sender',
    query_id: 'QUERY',
    receiver: {
      added_to_attachment_menu: false,
      allows_write_to_pm: true,
      first_name: 'receiver-first-name',
      id: 991,
      is_bot: false,
      is_premium: true,
      language_code: 'ru',
      last_name: 'receiver-last-name',
      photo_url: 'receiver-photo',
      username: 'receiver-username',
    },
    start_param: 'debug',
    user: {
      added_to_attachment_menu: false,
      allows_write_to_pm: false,
      first_name: 'user-first-name',
      id: 222,
      is_bot: true,
      is_premium: false,
      language_code: 'en',
      last_name: 'user-last-name',
      photo_url: 'user-photo',
      username: 'user-username',
    },
  },
  '5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8',
  new Date(1000),
);
```

```ts [Node.js (functional)]
import { signFp } from '@tma.js/init-data-node';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

pipe(
  signFp(
    {
      can_send_after: 10000,
      chat: {
        id: 1,
        type: 'group',
        username: 'my-chat',
        title: 'chat-title',
        photo_url: 'chat-photo',
      },
      chat_instance: '888',
      chat_type: 'sender',
      query_id: 'QUERY',
      receiver: {
        added_to_attachment_menu: false,
        allows_write_to_pm: true,
        first_name: 'receiver-first-name',
        id: 991,
        is_bot: false,
        is_premium: true,
        language_code: 'ru',
        last_name: 'receiver-last-name',
        photo_url: 'receiver-photo',
        username: 'receiver-username',
      },
      start_param: 'debug',
      user: {
        added_to_attachment_menu: false,
        allows_write_to_pm: false,
        first_name: 'user-first-name',
        id: 222,
        is_bot: true,
        is_premium: false,
        language_code: 'en',
        last_name: 'user-last-name',
        photo_url: 'user-photo',
        username: 'user-username',
      },
    },
    '5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8',
    new Date(1000),
  ),
  E.match(
    error => {
      // Something went wrong.
    },
    signedData => {
      // Signing is successful.
    },
  ),
);
```

```typescript [Web Crypto API]
import { sign } from '@tma.js/init-data-node/web';

await sign(
  {
    can_send_after: 10000,
    chat: {
      id: 1,
      type: 'group',
      username: 'my-chat',
      title: 'chat-title',
      photo_url: 'chat-photo',
    },
    chat_instance: '888',
    chat_type: 'sender',
    query_id: 'QUERY',
    receiver: {
      added_to_attachment_menu: false,
      allows_write_to_pm: true,
      first_name: 'receiver-first-name',
      id: 991,
      is_bot: false,
      is_premium: true,
      language_code: 'ru',
      last_name: 'receiver-last-name',
      photo_url: 'receiver-photo',
      username: 'receiver-username',
    },
    start_param: 'debug',
    user: {
      added_to_attachment_menu: false,
      allows_write_to_pm: false,
      first_name: 'user-first-name',
      id: 222,
      is_bot: true,
      is_premium: false,
      language_code: 'en',
      last_name: 'user-last-name',
      photo_url: 'user-photo',
      username: 'user-username',
    },
  },
  '5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8',
  new Date(1000),
);
```

```typescript [Web Crypto API (functional)]
import { signFp } from '@tma.js/init-data-node/web';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

pipe(
  signFp(
    {
      can_send_after: 10000,
      chat: {
        id: 1,
        type: 'group',
        username: 'my-chat',
        title: 'chat-title',
        photo_url: 'chat-photo',
      },
      chat_instance: '888',
      chat_type: 'sender',
      query_id: 'QUERY',
      receiver: {
        added_to_attachment_menu: false,
        allows_write_to_pm: true,
        first_name: 'receiver-first-name',
        id: 991,
        is_bot: false,
        is_premium: true,
        language_code: 'ru',
        last_name: 'receiver-last-name',
        photo_url: 'receiver-photo',
        username: 'receiver-username',
      },
      start_param: 'debug',
      user: {
        added_to_attachment_menu: false,
        allows_write_to_pm: false,
        first_name: 'user-first-name',
        id: 222,
        is_bot: true,
        is_premium: false,
        language_code: 'en',
        last_name: 'user-last-name',
        photo_url: 'user-photo',
        username: 'user-username',
      },
    },
    '5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8',
    new Date(1000),
  ),
  TE.match(
    error => {
      // Something went wrong.
    },
    signedData => {
      // Signing is successful.
    },
  ),
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

- **Data to sign**: It represents a parsed init data object excluding the `auth_date` and `hash`
  properties. The `signature` property is optional as it can't be computed.
- **Bot token**: This token is received from [@BotFather](https://t.me/botfather).
- **Signing date**: This value will be used as the value of the `auth_date` property.

As a result, the function returns signed init data.

## Passing Hashed Token

This package allow developers to use a hashed token instead of a raw token.

By "hashed token," we mean a token hashed using the HMAC-SHA-256 algorithm with a key derived
from `WebAppData`, as specified in
the [validation](../../../platform/init-data#validating) section of the documentation.

Here are some examples:

```ts
import { sign } from '@tma.js/init-data-node';

sign(
  {
    can_send_after: 10000,
    chat: {
      id: 1,
      type: 'group',
      username: 'my-chat',
      title: 'chat-title',
      photo_url: 'chat-photo',
    },
    chat_instance: '888',
    chat_type: 'sender',
    query_id: 'QUERY',
    receiver: {
      added_to_attachment_menu: false,
      allows_write_to_pm: true,
      first_name: 'receiver-first-name',
      id: 991,
      is_bot: false,
      is_premium: true,
      language_code: 'ru',
      last_name: 'receiver-last-name',
      photo_url: 'receiver-photo',
      username: 'receiver-username',
    },
    start_param: 'debug',
    user: {
      added_to_attachment_menu: false,
      allows_write_to_pm: false,
      first_name: 'user-first-name',
      id: 222,
      is_bot: true,
      is_premium: false,
      language_code: 'en',
      last_name: 'user-last-name',
      photo_url: 'user-photo',
      username: 'user-username',
    },
  },
  // Hashed secret token.
  'a5c609aa52f63cb5e6d8ceb6e4138726ea82bbc36bb786d64482d445ea38ee5f',
  new Date(1000),
  { tokenHashed: true }
);
```

You can use this approach to reduce the number of instances where you directly pass a raw token.