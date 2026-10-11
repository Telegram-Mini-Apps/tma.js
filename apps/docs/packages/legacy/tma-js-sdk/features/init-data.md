---
outline: [ 2, 3 ]
---

# 💠Init Data

A component responsible for the Telegram Mini
Apps [init data](../../../../platform/init-data.md).

## Restoring

To restore the component state, use the `restore` method.

```ts
import { initData } from '@tma.js/sdk';

initData.restore();
```

## Parsing

To parse a value as init data, use the `parseInitDataQuery` function.

```ts
import { parseInitDataQuery } from '@tma.js/sdk';

const initData = parseInitDataQuery('auth_date=123&query_id=anQQ231vs&...');
// {
//   user: {
//     id: 99281932,
//     first_name: 'Andrew',
//     last_name: 'Rogue',
//     username: 'rogue',
//     language_code: 'en',
//     is_premium: true,
//     allows_write_to_pm: true,
//   },
//   hash: 'abcedef123',
//   auth_date: Date(1716922846000),
//   start_param: 'debug',
//   chat_type: 'sender',
//   chat_instance: '8428209589180549439',
// };
```

The function returns the [init data](../../../../platform/init-data.md#parameters-list) object.

## Signals

This section provides a complete list of signals related to the init data.

### `authDate`

Return type: `Date | undefined`

A date the initialization data was created.

```ts
initData.authDate(); // Date(1727368894000)
```

### `canSendAfter`

Return type: `number | undefined`

A number of seconds after which a message can be sent via the
method [answerWebAppQuery](https://core.telegram.org/bots/api#answerwebappquery).

```ts
initData.canSendAfter(); // 3600
```

### `canSendAfterDate`

Return type: `Date | undefined`

[canSendAfter](#cansendafter) but as a Date.

```ts
initData.canSendAfterDate(); // Date(1727368897600)
```

### `chat`

Return type: `undefined` or [`Chat`](../../../../platform/init-data.md#chat)

An object containing data about the chat where the bot was launched via the attachment menu.

> [!NOTE]
> Returned for supergroups, channels and group chats – only for Mini Apps launched via the attachment menu.

```ts
initData.chat();
// {
//   id: 7728725378876215,
//   type: 'group',
//   title: '@BotFather',
//   photo_url: 'https://example.com/image.png',
//   username: 'botfather'
// }
```

### `chatType`

Return type: `string | undefined`

A type of chat from which the Mini Apps was opened. Values:

- `sender`
- `private`
- `group`
- `supergroup`
- `channel`

> [!NOTE]
> Returned only for applications opened by direct link.

```ts
initData.chatType(); // 'group'
```

### `chatInstance`

Return type: `string | undefined`

A global identifier indicating the chat from which the Mini Apps was opened.

> [!WARNING]
> Returned only for applications opened by direct link.

```ts
initData.chatInstance(); // 'group'
```

### `hash`

Return type: `string | undefined`

An initialization data signature.

```ts
initData.hash(); // 'group'
```

### `queryId`

Return type: `string | undefined`

A unique session ID of the Mini App. Used in the process of sending a message via the
method [answerWebAppQuery](https://core.telegram.org/bots/api#answerwebappquery).

```ts
initData.queryId(); // 'hSvhacj28716'
```

### `raw`

Return type: `string | undefined`

A raw string representation of the initialization data.

```ts
initData.raw(); // 'user=...&chat=...&...'
```

### `receiver`

Return type: `undefined` or [`User`](../../../../platform/init-data.md#user)

An object containing data about the chat partner of the current user in the chat where the bot was launched via the
attachment menu.

> [!NOTE]
> Returned only for private chats and only for Mini Apps launched via the attachment menu.

```ts
initData.receiver();
// {
//   added_to_attachment_menu: false,
//   allows_write_to_pm: true,
//   is_premium: true,
//   first_name: 'Pavel',
//   id: 78262681,
//   is_bot: false,
//   last_name: 'Durov',
//   language_code: 'ru',
//   photo_url: 'https://example.com/image.png',
//   username: 'durove',
// }
```

### `state`

Return type: `undefined` or [`InitData`](../../../../platform/init-data.md#parameters-list)

An object containing the initialization data in object format.

```ts
initData.state();
```

### `startParam`

Return type: `string | undefined`

A value of the `startattach` or `startapp` query parameter specified in the link.

```ts
initData.startParam(); // 'my-value'
```

### `user`

Return type: `undefined` or [`User`](../../../../platform/init-data.md#user)

An object containing information about the current user.

```ts
initData.user();
// {
//   added_to_attachment_menu: false,
//   allows_write_to_pm: true,
//   is_premium: true,
//   first_name: 'Pavel',
//   id: 78262681,
//   is_bot: false,
//   last_name: 'Durov',
//   language_code: 'ru',
//   photo_url: 'https://example.com/image.png',
//   username: 'durove',
// }
```
