---
outline: [ 2, 3 ]
---

# ⚙️Uncategorized

Functions not belonging to any other group.

Functions calling the Telegram client have the `isSupported` function. It returns `true` if the
SDK is [initialized](../initializing.md) and the Telegram client supports the function. Calling
them throws `NotInitializedError` if the SDK is not initialized, and `MethodUnsupportedError` if
the function is unsupported. Asynchronous ones accept an optional object with the `timeout` and
`signal` properties. If the signal was aborted, the returned promise is rejected with
`signal.reason`.

```ts
import { hideKeyboard } from '@tma.js/sdk';

if (hideKeyboard.isSupported()) {
  hideKeyboard();
}
```

## `copyTextToClipboard`

Copies the text to the clipboard. It uses the Clipboard API and falls back to the legacy way if
the API is unavailable or failed. The function doesn't call the Telegram client, so it doesn't
require the SDK to be initialized and has no `isSupported` function.

```ts
import { copyTextToClipboard } from '@tma.js/sdk';

await copyTextToClipboard('My text goes here');
```

## `downloadFile`

Asks the user to download a file. It accepts an HTTPS URL of the file, a suggested file name, and
optional options. The function is supported since Mini Apps v8.0.

```ts
import { downloadFile } from '@tma.js/sdk';

await downloadFile(
  'https://telegram.org/js/telegram-web-app.js',
  'telegram-sdk.js',
);
```

The promise is resolved when the user accepted the download, and is rejected with
`AccessDeniedError` if the user declined it, or with `TimeoutError` if the user didn't respond in
time. The `safeDownloadFile` function returns these errors as a result instead of throwing them.

## `getCurrentTime`

Retrieves the current Telegram server time as a `Date`. The function is supported since Mini Apps
v6.9.

```ts
import { getCurrentTime } from '@tma.js/sdk';

const time = await getCurrentTime(); // Date
```

The promise is rejected with:

- `InvokeCustomMethodFailedError` if the Telegram client failed to get the time;
- `TimeoutError` if the Telegram client didn't respond in time;
- `InvalidResponseError` if the Telegram client responded with an unexpected value.

The `safeGetCurrentTime` function returns these errors as a result instead of throwing them.

## `hideKeyboard`

Hides the on-screen keyboard, if it is visible. The function is supported since Mini Apps v9.1.

```ts
import { hideKeyboard } from '@tma.js/sdk';

hideKeyboard();
```

## `readTextFromClipboard`

Reads text from the clipboard. The function is supported since Mini Apps v6.4. Call it only in
response to a user interaction, e.g. a click.

The promise is resolved with the clipboard text, or `null` if the clipboard contains no text or
the access was not granted.

```ts
import { readTextFromClipboard } from '@tma.js/sdk';

const text = await readTextFromClipboard(); // string | null
```

The promise is rejected with `TimeoutError` if the Telegram client didn't respond in time. The
`safeReadTextFromClipboard` function returns it as a result instead of throwing it.

## `requestChat`

Asks the user to choose a chat to share with the mini app. It accepts the identifier of a prepared
keyboard button returned by the bot. The function is supported since Mini Apps v9.6.

```ts
import { requestChat } from '@tma.js/sdk';

await requestChat('prepared button id');
```

The promise is resolved when the chat was shared, and is rejected with `RequestChatError` if the
chat was not shared, or with `TimeoutError` if the user didn't respond in time. The `data.error`
property of `RequestChatError` contains the error reported by the Telegram client. The
`safeRequestChat` function returns these errors as a result instead of throwing them.

## `retrieveAndroidDeviceData`

Retrieves the [Android device data](https://core.telegram.org/bots/webapps#additional-data-in-user-agent)
Telegram for Android adds to `navigator.userAgent`. The function doesn't require the SDK to be
initialized.

The function always returns an object, and all its keys are optional. Outside Telegram for
Android, the object is empty.

```ts
import { retrieveAndroidDeviceData } from '@tma.js/sdk';

const data = retrieveAndroidDeviceData();
// Example complete output:
// {
//   appVersion: '11.11.0',
//   manufacturer: 'Samsung',
//   model: 'SM-A155F',
//   androidVersion: '14',
//   sdkVersion: 34,
//   performanceClass: 'AVERAGE',
// }
```

## `retrieveAndroidDeviceDataFrom`

This function works the same way as [retrieveAndroidDeviceData](#retrieveandroiddevicedata), but
accepts the user agent to parse.

```ts
import { retrieveAndroidDeviceDataFrom } from '@tma.js/sdk';

const data = retrieveAndroidDeviceDataFrom(
  'Telegram-Android/11.11.0 (Samsung SM-A155F; Android 14; SDK 34; AVERAGE)',
);
```

## `sendData`

Sends data to the bot and closes the mini app. The bot receives a service message with the
`web_app_data` field. See the [Message](https://core.telegram.org/bots/api#message) class for
more details.

```ts
import { sendData } from '@tma.js/sdk';

sendData('my-data-goes-here');
```

The function throws `NotInitializedError` if the SDK is not initialized, and
`InvalidArgumentsError` if the data is empty or longer than 4096 bytes. The `safeSendData`
function returns `InvalidArgumentsError` as a result instead of throwing it. Their `isSupported`
function returns `true` if the SDK is initialized.

> [!WARNING]
> This function is available only for mini apps launched via a keyboard button.

## `shareMessage`

Opens a dialog allowing the user to share a message prepared by the bot. It accepts a message
identifier returned by the [savePreparedInlineMessage](https://core.telegram.org/bots/api#savepreparedinlinemessage)
Bot API method. The function is supported since Mini Apps v8.0.

```ts
import { shareMessage } from '@tma.js/sdk';

await shareMessage('my message id');
```

The promise is resolved when the message was shared, and is rejected with `ShareMessageError` if
the message was not shared, or with `TimeoutError` if the user didn't respond in time. The
`data.error` property of `ShareMessageError` contains the error reported by the Telegram client.
The `safeShareMessage` function returns these errors as a result instead of throwing them.

## `shareStory`

Opens the native story editor. The function is supported since Mini Apps v7.8.

It has one required parameter: a media URL that will be used as the background for the story.

```ts
import { shareStory } from '@tma.js/sdk';

shareStory('https://my.media/background.png');
```

The function optionally accepts an object with additional options:

- `text?: string`: a caption to add to the media, 0-200 characters for regular users, and
  0-2048 characters for [premium subscribers](https://telegram.org/faq_premium#telegram-premium);
- `widgetLink?: object`: a widget link to include in the story. Only
  [premium subscribers](https://telegram.org/faq_premium#telegram-premium) can post stories with
  links.
  - `url: string`: the URL to include in the story;
  - `name?: string`: the display name of the link, 0-48 characters.

```ts
shareStory('https://my.media/background.png', {
  text: 'Today was a good day. Love it! Thanks to this public!',
  widgetLink: {
    url: 'https://t.me/heyqbnk',
    name: 'heyqbnk public group',
  },
});
```

## `switchInlineQuery`

Asks the user to choose a chat, opens it, and inserts the bot username and the specified query
into the input field. The second optional argument specifies chat types the user can choose from:
`users`, `bots`, `groups` and `channels`. If it is empty, all types are allowed. The function is
supported since Mini Apps v6.7.

```ts
import { switchInlineQuery } from '@tma.js/sdk';

switchInlineQuery('Check this bot!', [
  'users',
  'bots',
  'groups',
  'channels',
]);
```

The function is available only if the mini app was launched in inline mode, i.e. the
`tgWebAppBotInline` launch parameter is set. Otherwise, it throws `InvalidEnvError`. Its
`isSupported` function takes the inline mode into account.

## Colors

Helpers working with colors. They don't require the SDK to be initialized.

### `isRGB`

Returns `true` if the value is a color in the `#RRGGBB` format.

```ts
import { isRGB } from '@tma.js/sdk';

isRGB('#aabbcc'); // true
isRGB('#abc'); // false
```

### `toRGB`

Converts a color to the `#RRGGBB` format. It accepts the following formats: `#RGB`, `#RGBA`,
`#RRGGBB`, `#RRGGBBAA`, `rgb(r, g, b)` and `rgba(r, g, b, a)`. The alpha channel is dropped.

```ts
import { toRGB } from '@tma.js/sdk';

toRGB('#fff'); // '#ffffff'
toRGB('#AABBCCDD'); // '#aabbcc'
toRGB('rgb(255, 0, 128)'); // '#ff0080'
toRGB('rgba(255, 0, 128, 0.5)'); // '#ff0080'
```

The function throws `InvalidColorError` if the color has an unknown format. The `data.color`
property contains the passed value. The `safeToRGB` function returns the error as a result
instead of throwing it:

```ts
import { safeToRGB } from '@tma.js/sdk';

const result = safeToRGB('red');
if (!result.ok) {
  console.error(result.error); // InvalidColorError
}
```

### `isColorDark`

Returns `true` if the color is dark. It accepts a color in any format supported by
[toRGB](#torgb).

```ts
import { isColorDark } from '@tma.js/sdk';

isColorDark('#17212b'); // true
isColorDark('rgb(255, 255, 255)'); // false
```

The function throws `InvalidColorError` if the color has an unknown format. The
`safeIsColorDark` function returns the error as a result instead of throwing it.
