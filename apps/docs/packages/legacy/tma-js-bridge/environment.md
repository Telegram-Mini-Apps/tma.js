# Environment

This package is designed to be used only inside the Telegram application. Since non-Telegram
environments lack Telegram-specific traits, calling methods such
as [retrieveLaunchParams](launch-parameters.md) or [postEvent](methods.md#postevent) will lead to
errors.

Nevertheless, the package provides utilities that help developers either develop the application
outside of Telegram or determine if the current environment is not a Telegram Mini Apps at all.

## Validating Current Environment

To check if the current environment is Telegram Mini Apps, a developer can use the `isTMA` function.
It works in two modes: **simple** and **complete**.

### Simple

In this mode, the function attempts to retrieve launch parameters from the environment.

If the extraction is successful, the environment is considered Telegram Mini Apps.
Simple mode is synchronous and returns a boolean value.

```ts
import { isTMA } from '@tma.js/bridge';

if (isTMA()) {
  // ...
}
```

This mode is somewhat superficial but may still be sufficient for most applications. For a more
reliable check, use the [complete](#complete) mode.

### Complete

In this mode, the function calls a Telegram Mini Apps-specific method and waits for a
method-specific event to occur.

```ts
import { isTMA } from '@tma.js/bridge';

if (await isTMA('complete')) {
  console.log('It\'s Telegram Mini Apps');
}
```

The function waits for an event for 100 milliseconds and most of the time it is enough, but a
developer can change this behavior by passing an object as the second argument with
the `timeout: number` property.

```ts
if (await isTMA('complete', { timeout: 50 })) {
  console.log('It\'s Telegram Mini Apps');
}
```

You can also use a [functional alternative](functional-approach.md) - `isTMAFp`:

```typescript
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { isTMAFp } from '@tma.js/bridge';

pipe(isTMAFp('complete'), TE.match(
  error => {
    // Something went wrong.
  },
  isTMA => {
    // Check is done, use the argument.
  }
));
```

## Mocking Environment

The package provides the `mockTelegramEnv` function, which imitates the environment provided by
Telegram. It helps developers start building applications even without creating a mini app record in
[BotFather](https://t.me/botfather).

This function optionally accepts an object with two optional properties—**launchParams** and
**onEvent**.

### `launchParams`

Launch parameters to use in the mock. It can be presented as a query parameters
list (a string or a `URLSearchParams` instance) described
in [this](../../../platform/launch-parameters) article, or launch parameters-like object with the
`tgWebAppData` property missing, or presented as a query parameters list described
in [this](../../../../platform/init-data#parameters-list) article.

> [!TIP]
> Don't worry, this value will be validated, and the package will let you know that something is off.

### `onEvent`

Function that will be called in case any Mini Apps method was called by your
application. It allows a developer to define a custom handling behavior if needed.

The function receives a tuple, containing the method name as the first argument, and its payload as
the second one.

As the second argument, it accepts a function that attempts to call the native `postEvent`
function usually defined by the Telegram client. So, the `mockTelegramEnv` function may be used
even inside Telegram Mini Apps environment to intercept all methods' calls and pass them further
if needed.

### Example

Here is the complete example you may use in your application:

```ts
import { mockTelegramEnv, emitEvent } from '@tma.js/bridge';

const noInsets = {
  left: 0,
  top: 0,
  bottom: 0,
  right: 0,
} as const;
const themeParams = {
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
} as const;

mockTelegramEnv({
  launchParams: {
    tgWebAppThemeParams: themeParams,
    tgWebAppData: new URLSearchParams([
      ['user', JSON.stringify({
        id: 1,
        first_name: 'Pavel',
      })],
      ['hash', ''],
      ['signature', ''],
      ['auth_date', Date.now().toString()],
    ]),
    tgWebAppStartParam: 'debug',
    tgWebAppVersion: '8',
    tgWebAppPlatform: 'tdesktop',
  },
  onEvent(event) {
    // event here is an object { event: string; params?: any }, but 
    // typed depending on the "event" prop.
    if (event.name === 'web_app_request_theme') {
      return emitEvent('theme_changed', { theme_params: themeParams });
    }
    if (event.name === 'web_app_request_viewport') {
      return emitEvent('viewport_changed', {
        height: window.innerHeight,
        width: window.innerWidth,
        is_expanded: true,
        is_state_stable: true,
      });
    }
    if (event.name === 'web_app_request_content_safe_area') {
      return emitEvent('content_safe_area_changed', noInsets);
    }
    if (event.name === 'web_app_request_safe_area') {
      return emitEvent('safe_area_changed', noInsets);
    }
  },
});
```
