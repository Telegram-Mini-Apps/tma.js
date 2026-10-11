# ⚙️Links

Functions opening links and sharing URLs.

All functions require the SDK to be [initialized](../initializing.md) and throw
`NotInitializedError` otherwise. Their `isSupported` method returns `true` if the SDK is
initialized.

## `openLink`

To open a link in an external browser, use the `openLink` function. The mini app is not closed.
Call it only in response to the user interaction.

The second argument is an optional object with the following properties:

- `tryInstantView?: boolean`: open the link in the [Instant View](https://instantview.telegram.org/)
  mode, if possible. Supported since Mini Apps v6.4;
- `tryBrowser?: OpenLinkBrowser`: preferred browser to open the link in, for example, `'chrome'`
  or `'firefox'`. Supported since Mini Apps v7.6.

```ts
import { openLink } from '@tma.js/sdk';

openLink('https://telegram.org', {
  tryBrowser: 'chrome',
  tryInstantView: true,
});
```

To check if an option is supported, use the `supports` method:

```ts
openLink.supports('tryInstantView'); // boolean
openLink.supports('tryBrowser'); // boolean
```

`openLink` throws `InvalidArgumentsError` if the URL is invalid. Relative URLs are considered
invalid. `safeOpenLink` returns this error as a result instead of throwing it.

```ts
import { safeOpenLink } from '@tma.js/sdk';

const result = safeOpenLink('https://telegram.org');
if (!result.ok) {
  console.error(result.error); // InvalidArgumentsError
}
```

## `openTelegramLink`

To open a Telegram link inside the Telegram client, use the `openTelegramLink` function. It
applies the native behavior described in the [Deep Links](https://core.telegram.org/api/links)
documentation. The mini app is closed.

The link must have one of the Telegram hostnames: `t.me`, `telegram.me` or `telegram.dog`.

```ts
import { openTelegramLink } from '@tma.js/sdk';

openTelegramLink('https://t.me/heyqbnk');
```

The second argument is an optional object with the `forceRequest?: boolean` property. Pass
`true` to make the Telegram client process the link even if it is already opened.

```ts
openTelegramLink('https://t.me/heyqbnk', { forceRequest: true });
```

In Telegram clients older than Mini Apps v6.1, the function changes the current location to the
link instead.

`openTelegramLink` throws `InvalidArgumentsError` if the URL is invalid or is not a Telegram
link. `safeOpenTelegramLink` returns this error as a result instead of throwing it.

```ts
import { safeOpenTelegramLink } from '@tma.js/sdk';

const result = safeOpenTelegramLink('https://example.com');
result.ok; // false
```

## `shareURL`

To share a URL with other users, channels or groups, use the `shareURL` function. It asks the
user to choose chats, and closes the mini app. The second argument is an optional text appended
after the URL.

```ts
import { shareURL } from '@tma.js/sdk';

shareURL('https://t.me/heyqbnk', 'Check out this cool group!');
```

## `isTelegramHostname`

To check if a hostname belongs to Telegram, use the `isTelegramHostname` function. It returns
`true` for `t.me`, `telegram.me` and `telegram.dog`. The function doesn't require the SDK to be
initialized.

```ts
import { isTelegramHostname } from '@tma.js/sdk';

isTelegramHostname('t.me'); // true
isTelegramHostname('example.com'); // false
```
