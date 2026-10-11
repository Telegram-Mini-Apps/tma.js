---
outline: [ 2, 3 ]
---

# Features

This package is designed to give developers full control over its lifecycle, including the
initialization process. Therefore, there are no pre-initialized features available for use;
developers must configure them themselves.

By *feature*, we refer to a collection of related functionality grouped into a single entity, or a
collection of functions. Examples of features include `backButton` and `mainButton`.

Features are provided in the following forms:

💠**Components**. They are exported as plain objects (singletons) and usually represent a stateful
entity. The simplest examples are `backButton`, `mainButton` and `hapticFeedback`. Components are
not classes: there is no way to create another instance of a component, and only their TypeScript
interfaces are exported, like `BackButton` or `MainButton`.

⚙️**Functions**. They are exported as separate functions not grouped into a single variable.
Examples include `openLink`, `shareURL`, `requestContact`, etc.

## Usage Prerequisites

Each feature has the following requirements:

1. **The SDK must be [initialized](./initializing.md)**. Otherwise, calling a function throws
   `NotInitializedError`.

```ts
import { init } from '@tma.js/sdk';

init();
```

2. **The feature must be supported by the Telegram client**. Otherwise, calling a function throws
   `MethodUnsupportedError`. See [Checking Support](#checking-support).

For stateful component methods, there is an additional requirement:

3. **The component must be mounted**. Otherwise, calling a method throws `NotMountedError`. See
   [Mounting](#mounting).

```ts
import { init, backButton } from '@tma.js/sdk';

// Initialize the SDK.
init();

if (backButton.isSupported()) {
  // Mount the Back Button component.
  backButton.mount();
  backButton.show();
}
```

## Checking Support

### `isSupported`

Components and functions have the `isSupported` method. It returns `true` if the SDK is
initialized and the Telegram client supports everything the feature relies on. Before
initialization, it always returns `false`.

```ts
import { backButton, shareStory, swipeBehavior } from '@tma.js/sdk';

if (swipeBehavior.isSupported()) {
  swipeBehavior.mount();
  swipeBehavior.disableVertical();
}

backButton.isSupported(); // true since Mini Apps v6.1
shareStory.isSupported(); // true since Mini Apps v7.8
```

`isSupported` is a regular function, not a reactive value. The supported Mini Apps version doesn't
change during the app lifetime, so the result changes only when the SDK gets initialized.

`isSupported` doesn't check if the component is mounted. To check if a method of a stateful
component can be called right now, check both:

```ts
import { backButton } from '@tma.js/sdk';

if (backButton.isSupported() && backButton.isMounted()) {
  backButton.show();
}
```

Component methods released later than the component itself have their own `isSupported` method.
For example, the mini app component exists since Mini Apps v6.1, but the bottom bar color can be
changed only since Mini Apps v7.10:

```ts
import { mainButton, miniApp, viewport } from '@tma.js/sdk';

miniApp.setBottomBarColor.isSupported(); // true since Mini Apps v7.10
viewport.requestFullscreen.isSupported(); // true since Mini Apps v8.0
mainButton.setIconCustomEmojiId.isSupported(); // true since Mini Apps v9.5
```

Components `themeParams`, `viewport`, `initData` and `serverless` don't depend on a specific
Mini Apps version, so they have no `isSupported` method.

### `supports`

Functions and methods with parameters released later than themselves also have the `supports`
method. It accepts the feature (parameter) name and returns `true` if the function can be called
and the Telegram client supports the feature.

```ts
import { mainButton, miniApp, openLink } from '@tma.js/sdk';

miniApp.setHeaderColor.supports('rgb'); // true since Mini Apps v6.9
miniApp.close.supports('returnBack'); // true since Mini Apps v7.6
mainButton.setParams.supports('iconCustomEmojiId'); // true since Mini Apps v9.5
openLink.supports('tryBrowser'); // true since Mini Apps v7.6
```

The full list of functions with the `supports` method:

| Function                                        | Features                                |
|-------------------------------------------------|-----------------------------------------|
| `miniApp.setHeaderColor`, `safeSetHeaderColor`  | `rgb`                                   |
| `miniApp.close`                                 | `returnBack`                            |
| `mainButton.setParams`                          | `hasShineEffect`, `iconCustomEmojiId`   |
| `secondaryButton.setParams`                     | `hasShineEffect`, `iconCustomEmojiId`   |
| `openLink`, `safeOpenLink`                      | `tryInstantView`, `tryBrowser`          |

Passing some of the unsupported parameters, like an RGB header color before Mini Apps v6.9 or a
custom emoji identifier before Mini Apps v9.5, throws `MethodParameterUnsupportedError`. Other
unsupported parameters are ignored by the Telegram client.

## Mounting

Stateful components must be mounted before changing their state. Mounting does the following:

- if the page was reloaded, restores the component state saved before the reload. This way, the
  SDK knows the actual state of the Telegram client UI, for example, if the back button is
  visible. The state is restored only on the first mount after the reload;
- otherwise, applies the initial state, which may be retrieved from the launch parameters or
  requested from the Telegram client;
- starts listening to the related Telegram client events.

Each stateful component has the `isMounted` [computed value](#computed-values) and the `unmount`
method:

```ts
import { backButton } from '@tma.js/sdk';

backButton.mount();
backButton.isMounted(); // true

backButton.unmount();
backButton.isMounted(); // false
```

The `mount` method throws `NotInitializedError` if the SDK is not initialized, and
`MethodUnsupportedError` if the component is unsupported. Mounting an already mounted component
does nothing.

### Asynchronous Mounting

Components `viewport`, `biometry` and `locationManager` request their state from the Telegram
client, so their `mount` method returns a promise. They also have the `safeMount` method returning
a [result](#handling-errors) with `TimeoutError` instead of throwing it, and the `isMounting`
computed value:

```ts
import { viewport } from '@tma.js/sdk';

const promise = viewport.mount({ timeout: 5000 });
viewport.isMounting(); // true
await promise;
viewport.isMounted(); // true
```

Calling `unmount` while the component is mounting cancels the pending mount.

### Components and Mounting

| Component                                                           | Mounting                                                                           |
|---------------------------------------------------------------------|------------------------------------------------------------------------------------|
| `backButton`, `settingsButton`, `mainButton`, `secondaryButton`     | Required by methods changing the state. `onClick` and `offClick` work without it.   |
| `closingBehavior`, `swipeBehavior`                                  | Required by methods changing the state.                                            |
| `miniApp`                                                           | Required by color setters and `bindCssVars`. `close` and `ready` work without it. Mounting `miniApp` also mounts `themeParams`. |
| `themeParams`                                                       | Required by `bindCssVars`. Mount it to receive the actual theme.                   |
| `viewport`                                                          | Asynchronous. Required by `bindCssVars`. `expand`, `requestFullscreen` and `exitFullscreen` work without it. |
| `biometry`                                                          | Asynchronous. Required by `authenticate`, `requestAccess` and `updateToken`.       |
| `locationManager`                                                   | Asynchronous. Required by `requestLocation`.                                       |
| `initData`                                                          | Not mountable. Call `restore` to read init data from launch parameters.            |
| Other components                                                    | Not mountable.                                                                     |

## Computed Values

Reactive values of components, like `backButton.isVisible`, `mainButton.state` or
`themeParams.bgColor`, are computed values of the `Computed` type. Call a computed value to get
its current value:

```ts
import { backButton } from '@tma.js/sdk';

backButton.isVisible(); // false
```

To track changes, use the `subscribe` method. The listener receives the next and the previous
values. The method returns a function removing the listener:

```ts
import { backButton } from '@tma.js/sdk';

const unsubscribe = backButton.isVisible.subscribe((next, prev) => {
  console.log('isVisible changed:', prev, '->', next);
});

// Later.
unsubscribe();
```

Computed values follow these rules:

- the listener is called only if the value has changed, which is checked using `Object.is`;
- unlike Svelte stores, the listener is not called on subscribe;
- a computed value returns the same reference until the value changes. For example,
  `viewport.safeAreaInsets()` returns the same object until the insets change;
- a computed value listens to its sources only while it has listeners.

Stateful components have the `state` computed value containing the complete component state:

```ts
import { mainButton } from '@tma.js/sdk';

mainButton.state(); // { text: 'Continue', isVisible: false, ... }
```

Computed values are read-only: they change only when the Telegram client sends an event or when
you call a component method.

### Using With Frameworks

The `subscribe` method is compatible with React's `useSyncExternalStore` and similar APIs of
other frameworks:

```ts
import { useSyncExternalStore } from 'react';
import { mainButton } from '@tma.js/sdk';

const isVisible = useSyncExternalStore(mainButton.isVisible.subscribe, mainButton.isVisible);
```

Framework bindings provide the `useComputed` function doing this for you:
[@tma.js/sdk-react](../tma-js-sdk-react.md), [@tma.js/sdk-vue](../tma-js-sdk-vue.md),
[@tma.js/sdk-solid](../tma-js-sdk-solid.md) and [@tma.js/sdk-svelte](../tma-js-sdk-svelte.md).

```tsx
import { backButton, useComputed } from '@tma.js/sdk-react';

function Component() {
  const isVisible = useComputed(backButton.isVisible);
  return <p>Back button is {isVisible ? 'visible' : 'hidden'}</p>;
}
```

## Handling Errors

### Throwing and Safe Functions

Functions and methods failing with *expected* errors, like a timeout, the user's refusal or
an invalid argument, have two versions:

- `x` throws the error;
- `safeX` returns a result object instead: `{ ok: true, data }` or `{ ok: false, error }`.

```ts
import { popup } from '@tma.js/sdk';

// Throwing version.
try {
  const buttonId = await popup.show({ message: 'Hello!', timeout: 60_000 });
} catch (e) {
  console.error(e);
}

// Safe version.
const result = await popup.safeShow({ message: 'Hello!', timeout: 60_000 });
if (result.ok) {
  const buttonId = result.data;
} else {
  console.error(result.error); // InvalidArgumentsError | TimeoutError
}
```

The error type of a safe function is a union of all its expected errors, so the compiler knows
what to handle. Use the `matchError` function to handle each error separately. Compilation fails
if any error is left unhandled:

```ts
import { matchError, popup } from '@tma.js/sdk';

const result = await popup.safeShow({
  title: 'Delete',
  message: 'Are you sure?',
  buttons: [{ id: 'delete', type: 'destructive', text: 'Delete' }, { type: 'cancel' }],
  timeout: 60_000,
});
if (!result.ok) {
  matchError(result.error, {
    InvalidArgumentsError: e => console.error('Invalid popup:', e.message),
    TimeoutError: () => console.error('The user did not respond'),
  });
}
```

Functions without expected errors, like `hideKeyboard`, `shareStory`, `shareURL` or
`switchInlineQuery`, have no safe version.

::: warning
Safe functions return only expected errors. Errors meaning that the SDK is used incorrectly or in
a wrong environment are always thrown, even by safe functions. For asynchronous functions, it
means the returned promise is rejected.
:::

### Errors

Errors thrown by any function, including safe ones:

| Error                             | Reason                                                                                       |
|-----------------------------------|----------------------------------------------------------------------------------------------|
| `NotInitializedError`             | The SDK is not [initialized](./initializing.md).                                             |
| `NotMountedError`                 | The component is not mounted. The component name is available in `error.data.component`.     |
| `MethodUnsupportedError`          | The Telegram client doesn't support the method. See `error.data.method` and `error.data.version`. |
| `MethodParameterUnsupportedError` | The Telegram client doesn't support the passed parameter.                                    |
| `ConcurrentCallError`             | The operation is started while the previous one is in progress, e.g. opening a popup while another one is opened. |
| `CSSVarsBoundError`               | CSS variables of the component are already bound.                                            |
| `InvalidEnvError`                 | The environment doesn't allow the operation, e.g. calling `switchInlineQuery` outside the inline mode. |

Errors returned by safe functions (and thrown by their throwing versions) depend on the function.
The most common ones:

| Error                           | Reason                                                                        |
|---------------------------------|-------------------------------------------------------------------------------|
| `TimeoutError`                  | The operation didn't complete in time. The timeout is in `error.data.timeout`. |
| `InvalidArgumentsError`         | Function arguments are invalid.                                               |
| `InvalidResponseError`          | The Telegram client responded with an unexpected value.                       |
| `AccessDeniedError`             | The user denied the requested action.                                         |
| `InvokeCustomMethodFailedError` | The Telegram client failed to perform a custom method.                        |

Some features have their own errors, for example, `BiometryUnavailableError`,
`FullscreenFailedError` or `ServerlessError`. They are described on the feature pages.

To check if a value is a specific error, use the static `is` method of the error class. Unlike
`instanceof`, it works even if the package is duplicated in the bundle:

```ts
import { NotMountedError, TimeoutError } from '@tma.js/sdk';

try {
  // ...
} catch (e) {
  if (TimeoutError.is(e)) {
    console.error('Timed out after', e.data.timeout, 'ms');
  } else if (NotMountedError.is(e)) {
    console.error('Mount', e.data.component, 'first');
  }
}
```

## Asynchronous Functions

Asynchronous functions accept an optional object with the following properties:

- `timeout?: number`: time in milliseconds to wait for the operation to complete. When reached,
  the function fails with `TimeoutError`;
- `signal?: AbortSignal`: signal to abort the operation. When aborted, the promise is rejected
  with `signal.reason`.

```ts
import { requestPhoneAccess } from '@tma.js/sdk';

const controller = new AbortController();
const promise = requestPhoneAccess({ timeout: 10_000, signal: controller.signal });

// Later.
controller.abort();
```

## Features List

Components:

- [Back Button](./features/back-button.md): `backButton`
- [Biometry](./features/biometry.md): `biometry`
- [Closing Behavior](./features/closing-behavior.md): `closingBehavior`
- [Cloud Storage](./features/cloud-storage.md): `cloudStorage`
- [Device Storage](./features/device-storage.md): `deviceStorage`
- [Haptic Feedback](./features/haptic-feedback.md): `hapticFeedback`
- [Init Data](./features/init-data.md): `initData`
- [Invoice](./features/invoice.md): `invoice`
- [Location Manager](./features/location-manager.md): `locationManager`
- [Main Button](./features/main-button.md): `mainButton`
- [Mini App](./features/mini-app.md): `miniApp`
- [Popup](./features/popup.md): `popup`
- [QR Scanner](./features/qr-scanner.md): `qrScanner`
- [Secondary Button](./features/secondary-button.md): `secondaryButton`
- [Secure Storage](./features/secure-storage.md): `secureStorage`
- [Serverless](./features/serverless.md): `serverless`
- [Settings Button](./features/settings-button.md): `settingsButton`
- [Swipe Behavior](./features/swipe-behavior.md): `swipeBehavior`
- [Theme Params](./features/theme-params.md): `themeParams`
- [Viewport](./features/viewport.md): `viewport`

Functions:

- [Emoji Status](./features/emoji-status.md): `requestEmojiStatusAccess`, `setEmojiStatus`
- [Home Screen](./features/home-screen.md): `addToHomeScreen`, `checkHomeScreenStatus`
- [Links](./features/links.md): `openLink`, `openTelegramLink`, `shareURL`
- [Privacy](./features/privacy.md): `requestPhoneAccess`, `requestWriteAccess`,
  `requestContact`, `requestContactComplete`
- [Uncategorized](./features/uncategorized.md): `copyTextToClipboard`, `readTextFromClipboard`,
  `downloadFile`, `getCurrentTime`, `hideKeyboard`, `requestChat`, `retrieveAndroidDeviceData`,
  `sendData`, `shareMessage`, `shareStory`, `switchInlineQuery`
