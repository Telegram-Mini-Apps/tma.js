# ⚙️Emoji Status

## `requestEmojiStatusAccess`

To request access to user emoji status update, use the `requestEmojiStatusAccess` function:

```ts
import { requestEmojiStatusAccess } from '@tma.js/sdk';

const status = await requestEmojiStatusAccess();
```

## `setEmojiStatus`

To set an emoji status on user's behalf, use the `setEmojiStatus` function.

As the first argument, it accepts a custom emoji id. Optionally, you can pass the second
argument determining for how many seconds the status must be set.

```ts
import { setEmojiStatus } from '@tma.js/sdk';

// Set for unlimited period of time.
await setEmojiStatus('5361800828313167608');

// Set for 1 day.
await setEmojiStatus('5361800828313167608', 86400);
```