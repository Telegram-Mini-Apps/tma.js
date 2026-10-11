# Environment

This package is designed to be used inside the Telegram application. Since non-Telegram
environments lack Telegram-specific traits, calling functions such as
[retrieveLaunchParams](launch-parameters.md) or [postEvent](methods.md#calling-methods) leads to
errors.

Nevertheless, the package provides utilities that help developers either develop the application
outside of Telegram or determine if the current environment is not a Telegram Mini App at all.

## Validating Current Environment

### `isTMA`

The `isTMA` function synchronously checks if the current environment looks like a Telegram Mini
App. It returns `true` if `window.TelegramWebviewProxy` is defined, or if launch parameters can be
[retrieved](launch-parameters.md#retrieving-launch-parameters).

```ts
import { isTMA } from '@tma.js/bridge';

if (isTMA()) {
  // ...
}
```

This check is somewhat superficial but may still be sufficient for most applications. For a more
reliable check, use [isTMAAsync](#istmaasync).

### `isTMAAsync`

The `isTMAAsync` function calls the
[web_app_request_theme](../../platform/methods.md#web-app-request-theme) method and waits for the
Telegram client to respond with the [theme_changed](../../platform/events.md#theme-changed) event.
If `window.TelegramWebviewProxy` is defined, it returns `true` immediately.

```ts
import { isTMAAsync } from '@tma.js/bridge';

if (await isTMAAsync()) {
  console.log('It\'s Telegram Mini Apps');
}
```

The function waits for the event for 100 milliseconds. Most of the time it is enough, but you can
change the timeout. The check can also be aborted with an `AbortSignal`, in which case the
returned promise is rejected with `signal.reason`.

```ts
import { isTMAAsync } from '@tma.js/bridge';

const controller = new AbortController();

if (await isTMAAsync({ timeout: 50, signal: controller.signal })) {
  console.log('It\'s Telegram Mini Apps');
}
```

### Other Checks

- `isIframe()` returns `true` if the app is opened in an iframe. Telegram Web clients open mini
  apps this way.
- `hasWebviewProxy()` returns `true` if the `window.TelegramWebviewProxy.postEvent` function is
  defined. Native Telegram clients define it to receive method calls.

## Mocking Environment

The package provides the `mockTelegramEnv` function, which imitates the environment provided by
Telegram. It helps developers start building applications even without creating a mini app record
in [BotFather](https://t.me/botfather), and also allows intercepting method calls inside Telegram,
for example, to fix a client not responding to some method.

The function accepts an object with two optional properties: `launchParams` and `onMethod`. It
returns a function reverting the mocked method calls handling.

### `launchParams`

Launch parameters to use in the mock. They can be presented as a query string or a
`URLSearchParams` instance (see the [launch parameters](../../platform/launch-parameters.md)
article), or as a `LaunchParams` object. In the object form, `tgWebAppData` is the raw init data
string (see the [init data](../../platform/init-data.md#parameters-list) article).

The value is validated, and the function throws `InvalidLaunchParamsError` if something is off.
Then, it is saved in the session storage, so the [launch parameters retrieving
functions](launch-parameters.md) return it. Launch parameters stay saved even after reverting the
mock.

### `onMethod`

A function called whenever the mini app calls a Mini Apps method. It receives the call as an object
with the method `name` and its `params` (typed depending on the name, `undefined` for methods
without parameters), and a `next` function passing the call to the original transport, if there
is one.

To respond to the call as the Telegram client would do, use the
[emitEvent](events.md#emitting-events) function.

::: tip
Outside iframes, the mock defines `window.TelegramWebviewProxy`, so method calls performed by other
libraries, including the official SDK, are intercepted too. In Telegram Web clients (iframe), only
calls performed by this package are intercepted.
:::

When mocking the environment several times, revert the mocks in the reverse order.

### Example

Here is a complete example you may use in your application:

```ts
import { mockTelegramEnv, emitEvent, type ThemeParams } from '@tma.js/bridge';

const noInsets = { left: 0, top: 0, bottom: 0, right: 0 };
const themeParams: ThemeParams = {
  accent_text_color: '#6ab2f2',
  bg_color: '#17212b',
  button_color: '#5288c1',
  button_text_color: '#ffffff',
  destructive_text_color: '#ec3942',
  header_bg_color: '#17212b',
  hint_color: '#708499',
  link_color: '#6ab3f3',
  secondary_bg_color: '#232e3c',
  section_bg_color: '#17212b',
  section_header_text_color: '#6ab3f3',
  subtitle_text_color: '#708499',
  text_color: '#f5f5f5',
};

const restore = mockTelegramEnv({
  launchParams: {
    tgWebAppThemeParams: themeParams,
    tgWebAppData: new URLSearchParams([
      ['user', JSON.stringify({ id: 1, first_name: 'Pavel' })],
      ['hash', ''],
      ['signature', ''],
      ['auth_date', Math.floor(Date.now() / 1000).toString()],
    ]).toString(),
    tgWebAppStartParam: 'debug',
    tgWebAppVersion: '9.1',
    tgWebAppPlatform: 'tdesktop',
  },
  onMethod({ name }, next) {
    if (name === 'web_app_request_theme') {
      return emitEvent('theme_changed', { theme_params: themeParams });
    }
    if (name === 'web_app_request_viewport') {
      return emitEvent('viewport_changed', {
        height: window.innerHeight,
        width: window.innerWidth,
        is_expanded: true,
        is_state_stable: true,
      });
    }
    if (name === 'web_app_request_content_safe_area') {
      return emitEvent('content_safe_area_changed', noInsets);
    }
    if (name === 'web_app_request_safe_area') {
      return emitEvent('safe_area_changed', noInsets);
    }
    // Pass other calls to the original transport, if any.
    next();
  },
});

// Later, to stop intercepting method calls:
restore();
```
