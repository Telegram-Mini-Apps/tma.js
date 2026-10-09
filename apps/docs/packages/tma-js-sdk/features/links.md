# ⚙️Links

## `openLink`

To open a link in an external browser or using [Instant View](https://instantview.telegram.org/),
use the `openLink` method. You can also pass an optional second argument, an object with optional
properties `tryBrowser: OpenLinkBrowser (string)` and `tryInstantView: boolean`.

```ts
import { openLink } from '@tma.js/sdk';

openLink('https://telegram.org', {
  tryBrowser: 'chrome',
  tryInstantView: true,
});
```

## `openTelegramLink`

To open a Telegram link with predefined behavior, use the `openTelegramLink` method. This method
allows you to apply the native behavior as described in
the [Deep Links](https://core.telegram.org/api/links) documentation.

```ts
import { openTelegramLink } from '@tma.js/sdk';

openTelegramLink('https://t.me/heyqbnk');
```

You can also pass an optional second argument, an object with the optional property
`forceRequest: boolean`, to make the Telegram client force the link request processing.

```ts
openTelegramLink('https://t.me/heyqbnk', { forceRequest: true });
```

## `shareURL`

To share a URL with another user, channel, or group, use the `shareURL` method.

```ts
import { shareURL } from '@tma.js/sdk';

shareURL('https://t.me/heyqbnk', 'Check out this cool group!');
```
