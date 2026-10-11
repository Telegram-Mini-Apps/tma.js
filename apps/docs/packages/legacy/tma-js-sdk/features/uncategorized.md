# ⚙️Uncategorized

## `copyTextToClipboard`

Copies specified text to the clipboard using all known methods.

```ts
import { copyTextToClipboard } from '@tma.js/sdk';

await copyTextToClipboard('My text goes here');
```

## `downloadFile`

To request file download, use the `downloadFile` function. It accepts a file URL and its proposed saved name.

```ts
import { downloadFile } from '@tma.js/sdk';

await downloadFile(
  'https://telegram.org/js/telegram-web-app.js',
  'telegram-sdk.js',
);
```

## `getCurrentTime`

To retrieve the current Telegram server time, use the `getCurrentTime` function. It returns
a JavaScript `Date` object.

```ts
import { getCurrentTime } from '@tma.js/sdk';

const time = await getCurrentTime(); // Date
```

## `hideKeyboard`

To hide the on-screen keyboard, use the `hideKeyboard` function.

```ts
import { hideKeyboard } from '@tma.js/sdk';

hideKeyboard();
```

## `readTextFromClipboard`

To read text from the clipboard, use the `readTextFromClipboard` function.

```ts
import { readTextFromClipboard } from '@tma.js/sdk';

const text = await readTextFromClipboard(); // string | null
```

## `retrieveAndroidDeviceData`

Retrieves [Android device data](https://core.telegram.org/bots/webapps#additional-data-in-user-agent) from the
`navigator.userAgent`.

The function always returns an object describing the Android device data with all keys marked as optional.

```ts
import { retrieveAndroidDeviceData } from '@tma.js/sdk';

const data = retrieveAndroidDeviceData();
// Example complete output:
// {
//   manufacturer: 'Samsung',
//   performanceClass: 'AVERAGE',
//   model: 'SM-A155F',
//   androidVersion: '14',
//   sdkVersion: 34,
// }
```

## `retrieveAndroidDeviceDataFrom`

This function works the same as [retrieveAndroidDeviceData](#retrieveandroiddevicedata), but allows passing a custom
value to parse.

```ts
import { retrieveAndroidDeviceDataFrom } from '@tma.js/sdk';

const data = retrieveAndroidDeviceDataFrom(navigator.userAgent);
// Example complete output:
// {
//   manufacturer: 'Samsung',
//   performanceClass: 'AVERAGE',
//   model: 'SM-A155F',
//   androidVersion: '14',
//   sdkVersion: 34,
// }
```

## `shareStory`

The `shareStory` method opens the native story editor.

It has one required parameter: a media URL that will be used as the background for the story.

```ts
import { shareStory } from '@tma.js/sdk';

shareStory('https://my.media/background.png');
```

The function optionally accepts an object with additional options:

- `text?: string` - a caption to add to the media, with a limit of 0-200 characters for regular
  users, and 0-2048 characters
  for [premium subscribers](https://telegram.org/faq_premium#telegram-premium).
- `widgetLink?: object` - an object for including a widget link in the story.
  Only [premium subscribers](https://telegram.org/faq_premium#telegram-premium) can post stories
  with links.
  - `url: string` - the URL to be included in the story.
  - `name?: string` - the display name for the widget link (0-48 characters).

```ts
shareStory('https://my.media/background.png', {
  text: 'Today was a good day. Love it! Thanks to this public!',
  widgetLink: {
    url: 'https://t.me/heyqbnk',
    name: 'heyqbnk public group',
  },
});
```

## `sendData`

To send data to the bot, use the `sendData` function. This function sends a service message to the
bot and closes the Mini App.

```ts
import { sendData } from '@tma.js/sdk';

sendData('my-data-goes-here');
```

> [!TIP]
> This function sends data up to 4096 bytes to the bot and is available for Mini Apps launched via a
> Keyboard button.

> [!WARNING]
> This function is only accessible for Mini Apps started through a Keyboard button. See
> the `web_app_data` field in the [Message](https://core.telegram.org/bots/api#message) class for
> more details.

## `requestChat`

To prompt the user to choose a chat to share with the Mini App, use the `requestChat` function.
It accepts the identifier of a prepared keyboard button returned by the bot.

```ts
import { requestChat } from '@tma.js/sdk';

await requestChat('prepared button id');
```

The function resolves when the chat was shared, and rejects with `RequestChatError` if Telegram
reports an error.

## `shareMessage`

To share a prepared by your server message, use the `shareMessage` function. It opens a dialog
allowing the user to share a message provided by the bot.

```ts
import { shareMessage } from '@tma.js/sdk';

await shareMessage('my message id');
```

The value passed to the function is a message identifier returned by
the [savePreparedInlineMessage](https://core.telegram.org/bots/api#savepreparedinlinemessage)
Telegram Bot API method.

## `switchInlineQuery`

To create a message prefixed with the bot username and a specific text, and share it in another
chat, use the `switchInlineQuery` method. You can use the second optional argument to specify which
chat types can be selected to send the message.

```ts
import { switchInlineQuery } from '@tma.js/sdk';

switchInlineQuery('Check this bot!', [
  'users',
  'bots',
  'groups',
  'channels',
]);
```
