---
outline: [ 2, 3 ]
---

# 💠Init Data

A component responsible for the Telegram Mini
Apps [init data](../../../platform/init-data.md).

## Restoring

The component reads init data from the `tgWebAppData` launch parameter. To do so, call the
`restore` method after the SDK is [initialized](../initializing.md). Until then, all computed
values of the component return `undefined`.

```ts
import { init, initData } from '@tma.js/sdk';

init();
initData.restore();
initData.user(); // { id: 99281932, first_name: 'Andrew', ... }
```

If launch parameters have no init data, the method does nothing, and the computed values keep
returning `undefined`.

`restore` throws `NotInitializedError` if the SDK is not initialized, and `InvalidInitDataError`
if init data is invalid. `safeRestore` returns `InvalidInitDataError` as a result instead of
throwing it.

```ts
const result = initData.safeRestore();
if (!result.ok) {
  console.error('Init data is invalid:', result.error);
}
```

::: tip
To parse, validate or sign init data, use the [@tma.js/init-data](../../tma-js-init-data.md)
package. The SDK re-exports the `InitData`, `User`, `Chat` and `ChatType` types, and the
`InvalidInitDataError` class from it.
:::

## Computed Values

This section provides a complete list of computed values related to init data. Each of them
returns `undefined` if init data was not restored or has no such property.

All values can be subscribed to:

```ts
const unsubscribe = initData.user.subscribe((next, prev) => {
  console.log('User changed:', prev, '->', next);
});
```

### `authDate`

Return type: `Date | undefined`

A date the init data was created.

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

[canSendAfter](#cansendafter) as a date, calculated from [authDate](#authdate).

```ts
initData.canSendAfterDate(); // Date(1727372494000)
```

### `chat`

Return type: `undefined` or [`Chat`](../../../platform/init-data.md#chat)

An object containing data about the chat where the bot was launched via the attachment menu.

> [!NOTE]
> Returned for supergroups, channels and group chats – only for Mini Apps launched via the
> attachment menu.

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

Return type: `ChatType | undefined`

A type of chat from which the mini app was opened. Values:

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

A global identifier indicating the chat from which the mini app was opened.

> [!WARNING]
> Returned only for applications opened by direct link.

```ts
initData.chatInstance(); // '8428209589180549439'
```

### `hash`

Return type: `string | undefined`

The init data signature.

```ts
initData.hash(); // 'abcedef123'
```

### `queryId`

Return type: `string | undefined`

A unique session ID of the mini app. Used in the process of sending a message via the
method [answerWebAppQuery](https://core.telegram.org/bots/api#answerwebappquery).

```ts
initData.queryId(); // 'hSvhacj28716'
```

### `raw`

Return type: `string | undefined`

The init data in the raw format. Pass it to your server to
[authorize the user](../../../platform/authorizing-user.md).

```ts
initData.raw(); // 'user=...&chat=...&...'
```

### `receiver`

Return type: `undefined` or [`User`](../../../platform/init-data.md#user)

An object containing data about the chat partner of the current user in the chat where the bot
was launched via the attachment menu.

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

### `signature`

Return type: `string | undefined`

The init data signature allowing third parties to validate it without the bot token.

```ts
initData.signature(); // 'abc...'
```

### `startParam`

Return type: `string | undefined`

A value of the `startattach` or `startapp` query parameter specified in the link.

```ts
initData.startParam(); // 'my-value'
```

### `state`

Return type: `undefined` or [`InitData`](../../../platform/init-data.md#parameters-list)

The whole init data object. Its keys are in snake case, and `auth_date` is a `Date`.

```ts
initData.state();
```

### `user`

Return type: `undefined` or [`User`](../../../platform/init-data.md#user)

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
