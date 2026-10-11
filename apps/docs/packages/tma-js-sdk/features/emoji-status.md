# ⚙️Emoji Status

Functions allowing the mini app to manage the user's emoji status. They are supported since Mini
Apps v8.0.

All functions have the `isSupported` method returning `true` if the SDK is
[initialized](../initializing.md) and the Telegram client supports the function. They throw
`NotInitializedError` if the SDK is not initialized, and `MethodUnsupportedError` if the function
is unsupported.

## `requestEmojiStatusAccess`

To request the permission for the bot to manage the user's emoji status, use the
`requestEmojiStatusAccess` function. It returns the request status, `'allowed'` if the
permission was granted.

```ts
import { requestEmojiStatusAccess } from '@tma.js/sdk';

if (requestEmojiStatusAccess.isSupported()) {
  const status = await requestEmojiStatusAccess();
}
```

The function accepts an optional object with the `timeout` and `signal` properties. It throws
`TimeoutError` if the user didn't respond in time. When the signal is aborted, the promise is
rejected with `signal.reason`.

`safeRequestEmojiStatusAccess` returns `TimeoutError` as a result instead of throwing it.

```ts
import { safeRequestEmojiStatusAccess } from '@tma.js/sdk';

const result = await safeRequestEmojiStatusAccess({ timeout: 30000 });
if (result.ok && result.data === 'allowed') {
  console.log('Access granted');
}
```

## `setEmojiStatus`

To ask the user to set a custom emoji as their status, use the `setEmojiStatus` function. As the
first argument, it accepts a custom emoji identifier. The second argument is an optional object
with the following properties:

- `duration?: number`: status duration in seconds. If omitted, the status is set for an
  unlimited period of time;
- `timeout?: number` and `signal?: AbortSignal`.

```ts
import { setEmojiStatus } from '@tma.js/sdk';

// Set for unlimited period of time.
await setEmojiStatus('5361800828313167608');

// Set for 1 day.
await setEmojiStatus('5361800828313167608', { duration: 86400 });
```

The function throws `SetEmojiStatusError` if the status was not set, and `TimeoutError` if the
user didn't respond in time. The error code sent by the Telegram client, for example,
`USER_DECLINED` or `SUGGESTED_EMOJI_INVALID`, is available in `error.data.error`.

`safeSetEmojiStatus` returns these errors as a result instead of throwing them.

```ts
import { safeSetEmojiStatus, SetEmojiStatusError } from '@tma.js/sdk';

const result = await safeSetEmojiStatus('5361800828313167608');
if (!result.ok && SetEmojiStatusError.is(result.error)) {
  console.error('Failed:', result.error.data.error);
}
```
