# @tma.js/sdk

TypeScript SDK for Telegram Mini Apps. It is built on top of
[@tma.js/bridge](../bridge) and re-exports it, so a single package covers both the low-level
communication with the Telegram client and the high-level components.

```bash
pnpm i @tma.js/sdk
```

## Initialization

Call `init` before using the SDK. It reads launch parameters, configures a `postEvent` function
checking whether methods are supported by the current Telegram client, and handles Telegram Web
specific events.

```ts
import { init, miniApp } from '@tma.js/sdk';

init();
miniApp.ready();
```

Functions using the Telegram client throw `NotInitializedError` if the SDK is not initialized.

To develop outside Telegram, mock the environment first:

```ts
import { init, mockTelegramEnv } from '@tma.js/sdk';

mockTelegramEnv({
  launchParams: {
    tgWebAppPlatform: 'tdesktop',
    tgWebAppVersion: '9.0',
    tgWebAppThemeParams: { bg_color: '#17212b' },
  },
});
init();
```

## Components

Components are plain objects. Stateful components must be mounted before changing their state.
Mounting restores the state saved before the page reload, so the SDK knows the actual state of
the Telegram client UI after reloads.

```ts
import { backButton, mainButton } from '@tma.js/sdk';

backButton.mount();
backButton.show();
const off = backButton.onClick(() => history.back());

mainButton.mount();
mainButton.setParams({ text: 'Submit', isVisible: true });
```

| Component         | Description                                                    |
|-------------------|----------------------------------------------------------------|
| `backButton`      | Back button in the header                                      |
| `mainButton`      | Main button at the bottom                                      |
| `secondaryButton` | Secondary button at the bottom                                 |
| `settingsButton`  | "Settings" item in the context menu                            |
| `closingBehavior` | Closing confirmation                                           |
| `swipeBehavior`   | Vertical swipes                                                |
| `miniApp`         | Header, background and bottom bar colors, `ready` and `close`  |
| `themeParams`     | Theme colors                                                   |
| `viewport`        | Size, safe areas and fullscreen mode                           |
| `initData`        | Init data passed by the Telegram client                        |
| `hapticFeedback`  | Device vibrations                                              |
| `popup`           | Native popups                                                  |
| `invoice`         | Invoices                                                       |
| `qrScanner`       | QR scanner                                                     |
| `biometry`        | Biometric authentication                                       |
| `locationManager` | Device location                                                |
| `cloudStorage`    | Cloud storage of the bot                                       |
| `deviceStorage`   | Persistent local storage                                       |
| `secureStorage`   | Storage for sensitive data                                     |
| `serverless`      | Telegram serverless endpoints                                  |

Some components retrieve their state from the Telegram client, so their `mount` is asynchronous:

```ts
import { viewport } from '@tma.js/sdk';

await viewport.mount();
viewport.bindCssVars(); // --tg-viewport-height, --tg-viewport-safe-area-inset-top, ...
```

### Reactivity

Reactive values of components, like `backButton.isVisible`, `mainButton.state` or
`themeParams.bgColor`, are computed values. Call one to get the current value, or subscribe to its
changes. Listeners receive the next and the previous values and are called only if the value has
changed:

```ts
import { backButton } from '@tma.js/sdk';

backButton.isVisible(); // false

const unsubscribe = backButton.isVisible.subscribe((next, prev) => {
  console.log('isVisible changed:', prev, '->', next);
});
```

Computed values return the same value until it changes, and their `subscribe` is compatible with
React's `useSyncExternalStore` and similar APIs of other frameworks:

```ts
import { useSyncExternalStore } from 'react';
import { mainButton } from '@tma.js/sdk';

const isVisible = useSyncExternalStore(mainButton.isVisible.subscribe, mainButton.isVisible);
```

Framework bindings wrap this API into `useComputed`: [@tma.js/sdk-react](../sdk-react),
[@tma.js/sdk-vue](../sdk-vue), [@tma.js/sdk-solid](../sdk-solid) and
[@tma.js/sdk-svelte](../sdk-svelte).

### Support checks

Components, functions, and component methods supported since a later Mini Apps version than the
component itself have `isSupported`. It returns false if the SDK is not initialized or the
Telegram client doesn't support the component or the function. Calling an unsupported method
throws `MethodUnsupportedError`.

```ts
import { miniApp, shareStory, swipeBehavior } from '@tma.js/sdk';

if (swipeBehavior.isSupported()) {
  swipeBehavior.mount();
  swipeBehavior.disableVertical();
}

shareStory.isSupported(); // true since Mini Apps v7.8
miniApp.setBottomBarColor.isSupported(); // true since Mini Apps v7.10
```

Functions and methods with parameters released later than themselves also have `supports`,
accepting the feature name. Passing some of the unsupported parameters, like an RGB header color
before Mini Apps v6.9, throws `MethodParameterUnsupportedError`. Others are ignored by the
Telegram client.

```ts
import { mainButton, miniApp, openLink } from '@tma.js/sdk';

miniApp.setHeaderColor.supports('rgb'); // true since Mini Apps v6.9
mainButton.setParams.supports('iconCustomEmojiId'); // true since Mini Apps v9.5
openLink.supports('tryBrowser'); // true since Mini Apps v7.6
```

## Handling errors

Functions and methods failing with expected errors have a `safe` counterpart returning the error
instead of throwing it. The error type is a union of all possible errors, so the compiler knows
what to handle:

```ts
import { matchError, popup } from '@tma.js/sdk';

const result = await popup.safeShow({
  title: 'Delete',
  message: 'Are you sure?',
  buttons: [{ id: 'delete', type: 'destructive', text: 'Delete' }, { type: 'cancel' }],
  timeout: 60_000,
});
if (!result.ok) {
  // Compilation fails if any error is left unhandled.
  return matchError(result.error, {
    InvalidArgumentsError: e => console.error('Invalid popup:', e.message),
    TimeoutError: () => console.error('The user did not respond'),
  });
}
const buttonId = result.data;
```

Environment and usage errors are always thrown: `NotInitializedError`, `NotMountedError`,
`MethodUnsupportedError`, `MethodParameterUnsupportedError`, `ConcurrentCallError` (e.g. opening
a popup while another one is opened), `CSSVarsBoundError` and `InvalidEnvError`. Asynchronous
functions accept `timeout` and `signal` options. Aborted operations are rejected with
`signal.reason`.

## Functions

```ts
import {
  openLink,
  openTelegramLink,
  requestContact,
  safeShareMessage,
  shareURL,
} from '@tma.js/sdk';

openLink('https://example.com', { tryInstantView: true });
openTelegramLink('https://t.me/heyqbnk');
shareURL('https://example.com', 'Look at this!');
const { contact } = await requestContact();
```

Other functions: `addToHomeScreen`, `checkHomeScreenStatus`, `copyTextToClipboard`,
`downloadFile`, `getCurrentTime`, `hideKeyboard`, `readTextFromClipboard`, `requestChat`,
`requestEmojiStatusAccess`, `requestPhoneAccess`, `requestWriteAccess`,
`retrieveAndroidDeviceData`, `sendData`, `setEmojiStatus`, `shareMessage`, `shareStory`,
`switchInlineQuery`, and the color helpers `isColorDark`, `isRGB` and `toRGB`.
