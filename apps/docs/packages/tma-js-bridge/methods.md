# Methods

This article covers topics related to [apps communication](../../platform/apps-communication.md)
methods. The list of all available methods and their parameters can be found in the
[platform documentation](../../platform/methods.md).

## Calling Methods

To call Telegram Mini Apps methods, use the `postEvent` function:

```ts
import { postEvent } from '@tma.js/bridge';

postEvent('web_app_ready');
postEvent('web_app_setup_back_button', { is_visible: true });
```

Method names and parameters are typed: the compiler knows which methods require parameters, which
accept optional ones and which accept none.

The function automatically determines the way to send the method based on the current environment:

- in Telegram Web clients (the app is opened in an iframe), it uses `window.parent.postMessage`;
- in Telegram for iOS, macOS, Android and Desktop, it uses
  `window.TelegramWebviewProxy.postEvent`;
- in Telegram for Windows Phone, it uses `window.external.notify`.

If none of these ways is available, which usually means the app was opened outside Telegram,
`postEvent` throws `UnknownEnvError`.

```ts
import { postEvent, UnknownEnvError } from '@tma.js/bridge';

try {
  postEvent('web_app_expand');
} catch (e) {
  if (UnknownEnvError.is(e)) {
    console.log('The app was opened outside Telegram');
  }
}
```

::: tip
The iframe check goes first. Telegram clients define `window.TelegramWebviewProxy` inside iframes
embedded by a mini app too, so a nested iframe always posts methods to its parent instead of
bypassing the mini app.
:::

Methods without parameters are sent with an empty string as the payload, the same way the official
SDK does it.

## Checking Method Support

`postEvent` does not check if the method is supported by the current Telegram client. To do this,
use the `supports` function. It accepts a Mini Apps method name and the Mini Apps version (the
[tgWebAppVersion](../../platform/launch-parameters.md#tgwebappversion) launch parameter):

```ts
import { supports } from '@tma.js/bridge';

supports('web_app_trigger_haptic_feedback', '6.0'); // false
supports('web_app_trigger_haptic_feedback', '6.1'); // true
```

Some method parameters were released later than the method itself. To check if such a parameter
is supported, pass its name as the second argument:

```ts
import { supports } from '@tma.js/bridge';

supports('web_app_open_link', 'try_instant_view', '6.0'); // false
supports('web_app_open_link', 'try_instant_view', '6.7'); // true
```

For unknown methods, the function returns `false`.

> [!TIP]
> It is recommended to check the method support before calling it to prevent apps from stalling
> or encountering unexpected behavior.

### Release Versions

To get the Mini Apps version a method or a method parameter was released in, use the
`getReleaseVersion` function. It returns `undefined` if the method is unknown.

```ts
import { getReleaseVersion } from '@tma.js/bridge';

getReleaseVersion('web_app_open_popup'); // '6.2'
getReleaseVersion('web_app_open_link', 'try_browser'); // '7.6'
```

To compare two Mini Apps versions, use `compareVersions`. It returns `1` if the first version is
greater, `-1` if it is lower, and `0` if they are equal:

```ts
import { compareVersions } from '@tma.js/bridge';

compareVersions('6.10', '6.9'); // 1
compareVersions('7.0', '7'); // 0
```

## Creating Safer `postEvent`

The `createPostEvent` function accepts the current Mini Apps version and returns a new `postEvent`
function, which checks if the passed method and its parameters are supported before calling it.

```ts
import { createPostEvent, retrieveLaunchParams } from '@tma.js/bridge';

const postEvent = createPostEvent(retrieveLaunchParams().tgWebAppVersion);
```

```ts
import { createPostEvent } from '@tma.js/bridge';

const postEvent = createPostEvent('6.5');

// Works fine.
postEvent('web_app_read_text_from_clipboard', { req_id: 'abc' });

// Throws MethodUnsupportedError: the method is not supported
// in Mini Apps version 6.5.
postEvent('web_app_request_phone');

// Throws MethodParameterUnsupportedError: the "color" parameter
// is not supported in Mini Apps version 6.5.
postEvent('web_app_set_header_color', { color: '#ffaabb' });
```

Only parameters making older clients misbehave are checked: `color` of
`web_app_set_header_color` and `icon_custom_emoji_id` of `web_app_setup_main_button` and
`web_app_setup_secondary_button`. Other versioned parameters are ignored by older clients, so they
are passed as is.

As the second optional argument, the function accepts a callback called instead of the method if
the method or its parameter is unsupported:

```ts
import { createPostEvent } from '@tma.js/bridge';

createPostEvent('6.0', data => {
  if ('param' in data) {
    console.warn(
      'Oops, the parameter', data.param,
      'in method', data.method,
      'is not supported in version', data.version,
    );
  } else {
    console.warn('Oops, method', data.method, 'is not supported');
  }
});
```

Though it is not recommended, to log warnings instead of throwing errors, pass the `'non-strict'`
value. In this mode, unsupported methods are not called.

```ts
import { createPostEvent } from '@tma.js/bridge';

const postEvent = createPostEvent('6.5', 'non-strict');

// Works fine.
postEvent('web_app_read_text_from_clipboard', { req_id: 'abc' });

// Shows a warning in the console, stating that the method
// is unsupported in version 6.5. Nothing else happens.
postEvent('web_app_request_phone');
```

The default value of the second argument is `'strict'`.

## Calling a Method and Waiting for an Event

Many methods make the Telegram client respond with an event. To call such a method and wait for
the response, use the `request` function described in the [Advanced](advanced.md) article.
