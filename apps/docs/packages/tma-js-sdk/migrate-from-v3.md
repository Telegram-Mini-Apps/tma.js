---
outline: [ 2, 3 ]
---

# Migrating from 3.x

This guide describes how to migrate from `@tma.js/sdk` 3.x to the current major version of the
package. The SDK was rewritten, so most of the public API changed: availability checks, reactive
values, error handling, asynchronous functions and initialization.

Changes not caught by TypeScript, meaning your code compiles but behaves differently, are marked
with warning blocks. Review them carefully.

::: tip
The SDK re-exports [@tma.js/bridge](../tma-js-bridge.md), so changes described in the
[bridge migration guide](../tma-js-bridge/migrate-from-v2.md) apply to code importing bridge
functions from `@tma.js/sdk`. For the overview of all packages, see
[Upgrading](../upgrading.md).

If you use framework bindings, also see the guides for
[@tma.js/sdk-react](../tma-js-sdk-react/migrate-from-v3.md),
[@tma.js/sdk-solid](../tma-js-sdk-solid/migrate-from-v3.md),
[@tma.js/sdk-vue](../tma-js-sdk-vue/migrate-from-v1.md) and
[@tma.js/sdk-svelte](../tma-js-sdk-svelte/migrate-from-v1.md). They re-export the SDK, so this
guide applies to them as well.
:::

## Overview of Breaking Changes

- **No fp-ts.** All `xFp` functions returning `Either` or `TaskEither` were replaced with `safeX`
  functions returning a plain result object: `{ ok: true, data }` or `{ ok: false, error }`.
  Regular `x` functions still throw.
- **No `BetterPromise`.** Asynchronous functions return a regular `Promise`. Operations are
  cancelled with a standard `AbortSignal` passed in the `signal` option (previously
  `abortSignal`). The `.cancel()` method and `CancelledError` are gone.
- **No signals.** Reactive values became [computed values](./features.md#computed-values) of the
  `Computed` type with a single `subscribe` method. Objects and arrays they return are frozen. The
  `@tma.js/signals` package was removed.
- **No `isAvailable` and `ifAvailable`.** Use `isSupported()`, which is now a regular function,
  and `supports(feature)`. Calling an unsupported method, a method before `init`, or a method of
  an unmounted component throws.
- **Components are singleton objects**, not classes. Classes, `instanceof` checks and `*Options`
  types are gone.
- **`init` is required for everything.** Functions that previously worked without `init` now
  throw `NotInitializedError`.
- **`init` options changed.** `version`, `isInlineMode` and `themeParams` were replaced with
  `launchParams`.

## Installation

Update the package:

::: code-group

```bash [pnpm]
pnpm i @tma.js/sdk@latest
```

```bash [npm]
npm i @tma.js/sdk@latest
```

```bash [yarn]
yarn add @tma.js/sdk@latest
```

:::

The package no longer depends on `fp-ts`, `better-promises`, `@tma.js/signals`,
`@tma.js/toolkit`, `@tma.js/transformers` and `@tma.js/types`. If your code imported them only to
work with the SDK, remove them from your dependencies:

```bash
pnpm remove fp-ts better-promises @tma.js/signals @tma.js/toolkit @tma.js/transformers @tma.js/types
```

The SDK now depends on [@tma.js/init-data](../tma-js-init-data.md) and re-exports its types. To
parse or serialize init data, install it and use its `parse` and `serialize` functions instead of
`parseInitDataQuery` and `serializeInitDataQuery`.

## Initialization

### Removed Options

The `version`, `isInlineMode` and `themeParams` options were removed. Pass the complete launch
parameters in the `launchParams` option instead:

::: code-group

```ts [Before]
import { init } from '@tma.js/sdk';

init({
  version: '8.0',
  isInlineMode: false,
  themeParams: { bg_color: '#17212b' },
});
```

```ts [After]
import { init } from '@tma.js/sdk';

init({
  launchParams: {
    tgWebAppPlatform: 'tdesktop',
    tgWebAppVersion: '8.0',
    tgWebAppBotInline: false,
    tgWebAppThemeParams: { bg_color: '#17212b' },
  },
});
```

:::

In most cases, no options are needed: `init()` retrieves launch parameters itself.

### `postEvent` Option

The `postEvent` option now accepts a throwing `PostEventFn` instead of `PostEventFpFn`.

::: warning
By default, the SDK now uses a `postEvent` function created with `createPostEvent` in the strict
mode. It throws `MethodUnsupportedError` if the Telegram client doesn't support the method, and
`MethodParameterUnsupportedError` if it doesn't support some of the passed parameters, like an RGB
header color before Mini Apps v6.9. Previously, the default function didn't check versions.

To log a warning instead of throwing, pass your own function:

```ts
import { createPostEvent, init, retrieveLaunchParams } from '@tma.js/sdk';

const launchParams = retrieveLaunchParams();
init({
  launchParams,
  postEvent: createPostEvent(launchParams.tgWebAppVersion, 'non-strict'),
});
```

:::

### `initFp` and `isInitialized`

`initFp` was replaced with `safeInit`, returning a result with `LaunchParamsRetrieveError`. The
new `isInitialized` function returns `true` if the SDK is initialized.

::: code-group

```ts [Before]
import { initFp } from '@tma.js/sdk';
import { either as E, function as fn } from 'fp-ts';

fn.pipe(initFp(), E.match(
  error => console.error(error),
  cleanup => {},
));
```

```ts [After]
import { safeInit } from '@tma.js/sdk';

const result = safeInit();
if (!result.ok) {
  console.error(result.error);
}
```

:::

### `init` Is Required for Everything

::: warning
In 3.x, many functions checked only that the app was running inside Telegram and worked without
calling `init`. Now all of them throw `NotInitializedError` until `init` is called:

- `closingBehavior`: all methods;
- `themeParams`: `mount` and `bindCssVars`;
- `mainButton`: all methods except `onClick` and `offClick`;
- `miniApp`: `mount`, `close`, `ready` and `bindCssVars`;
- `viewport`: `mount`, `expand` and `bindCssVars`;
- `initData.restore`;
- `openLink`, `sendData` and `shareURL`.

Make sure `init` is called before any SDK usage. `copyTextToClipboard`,
`retrieveAndroidDeviceData`, the color helpers and the bridge functions still work without it.
:::

### Other Changes

- Handling of the `reload_iframe` and `set_custom_style` events and sending `iframe_ready` are
  performed only when the app is launched in an iframe (Telegram Web).
- Calling `init` again first performs the cleanup of the previous call.

Learn more in the [Initializing](./initializing.md) section.

## Component Shape

Components are now plain singleton objects. Classes were removed, and only TypeScript interfaces
describing components are exported.

::: code-group

```ts [Before]
import { BackButton, backButton } from '@tma.js/sdk';

const myButton = new BackButton({ /* ... */ });
backButton instanceof BackButton; // true
```

```ts [After]
import { backButton, type BackButton } from '@tma.js/sdk';

// BackButton is an interface now. There is no way to create another
// back button instance.
const button: BackButton = backButton;
```

:::

As a result:

- creating components with `new` is no longer possible;
- `instanceof` checks against component classes no longer work;
- all dependency injection option types were removed: `BackButtonOptions`, `BiometryOptions`,
  `ClosingBehaviorOptions`, `CloudStorageOptions`, `DeviceStorageOptions`,
  `HapticFeedbackOptions`, `InitDataOptions`, `InvoiceOptions`, `LocationManagerOptions`,
  `MainButtonOptions`, `MiniAppOptions`, `PopupOptions`, `QrScannerOptions`,
  `SecondaryButtonOptions`, `SecureStorageOptions`, `ServerlessOptions`,
  `SettingsButtonOptions`, `SwipeBehaviorOptions`, `ThemeParamsOptions` and `ViewportOptions`;
- all `*Fp` methods were removed. See [Error Handling](#error-handling).

To test code using the SDK, mock the environment with `mockTelegramEnv` instead of creating
components with custom options.

## Availability Checks

| 3.x                                                                       | Current major version                                                              |
|---------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| `fn.isAvailable()`: reactive signal checking the environment, `init`, support and mount | Removed                                                              |
| `fn.ifAvailable(...args)`                                                 | Removed                                                                            |
| `x.isSupported()`: reactive signal                                        | `x.isSupported()`: regular function checking `init` and support, but not mount     |
| `fn.supports(feature)`: only `miniApp.setHeaderColor`                     | `miniApp.setHeaderColor`, `miniApp.close`, `mainButton.setParams`, `secondaryButton.setParams`, `openLink` |
| `FunctionUnavailableError` returned or thrown                             | `NotInitializedError`, `MethodUnsupportedError`, `MethodParameterUnsupportedError` or `NotMountedError` thrown |

`isSupported` now exists on all components depending on a Mini Apps version, including
`mainButton`, `closingBehavior`, `deviceStorage` and `secureStorage`, which didn't have it, and on
all functions. Methods released later than their component, like `miniApp.setBottomBarColor` or
`viewport.requestFullscreen`, have their own `isSupported`. Learn more in the
[Features](./features.md#checking-support) section.

### Replacing `isAvailable`

`isAvailable` checked the support and the mount status at once. Check them separately:

::: code-group

```ts [Before]
import { backButton } from '@tma.js/sdk';

if (backButton.show.isAvailable()) {
  backButton.show();
}
```

```ts [After]
import { backButton } from '@tma.js/sdk';

if (backButton.isSupported() && backButton.isMounted()) {
  backButton.show();
}
```

:::

### Replacing `ifAvailable`

The most common usage of `ifAvailable` was mounting a component and calling its methods only if
it was supported. Group these calls under a single check:

::: code-group

```ts [Before]
import { backButton, miniApp } from '@tma.js/sdk';

backButton.mount.ifAvailable();
backButton.show.ifAvailable();

miniApp.setBottomBarColor.ifAvailable('#aabbcc');
```

```ts [After]
import { backButton, miniApp } from '@tma.js/sdk';

if (backButton.isSupported()) {
  backButton.mount();
  backButton.show();
}

if (miniApp.setBottomBarColor.isSupported() && miniApp.isMounted()) {
  miniApp.setBottomBarColor('#aabbcc');
}
```

:::

If you used `ifAvailable` in many places, a small helper reproduces it:

```ts
type Checkable<A extends unknown[], R> = ((...args: A) => R) & { isSupported: () => boolean };

function ifSupported<A extends unknown[], R>(
  fn: Checkable<A, R>,
  ...args: A
): { ok: true; data: R } | { ok: false } {
  return fn.isSupported() ? { ok: true, data: fn(...args) } : { ok: false };
}

ifSupported(miniApp.setBottomBarColor, '#aabbcc');
```

::: warning
Unlike `isAvailable`, `isSupported` doesn't check if the component is mounted. Calling a method of
an unmounted component throws `NotMountedError`. Add `isMounted()` checks where the component
may be unmounted.

The SDK also no longer checks if the app is running inside Telegram. Calls are blocked only by
`init`, which fails outside Telegram unless the environment is mocked or launch parameters are
passed explicitly.
:::

## Reactivity

Signals from `@tma.js/signals` were replaced with computed values. Reading a value works the same
way: call it. To track changes, use the `subscribe` method:

| 3.x                                   | Current major version                                          |
|---------------------------------------|----------------------------------------------------------------|
| `value()`                             | `value()`                                                      |
| `value.sub(listener)`                 | `value.subscribe(listener)`                                    |
| `value.sub(listener, true)` (once)    | Call the returned function inside the listener                 |
| `value.unsub(listener)`               | Call the function returned by `subscribe`                      |
| `value.unsubAll()`                    | Call the functions returned by `subscribe`                     |
| `signal()`, `computed()`, `batch()`   | Removed                                                        |
| `Signal`, `SignalOptions` types       | Removed. The `Computed` type is exported from `@tma.js/sdk`    |

::: code-group

```ts [Before]
import { backButton } from '@tma.js/sdk';

function listener(isVisible: boolean) {
  console.log(isVisible);
}

backButton.isVisible.sub(listener);
backButton.isVisible.unsub(listener);

backButton.isVisible.sub(isVisible => {
  console.log('Called once:', isVisible);
}, true);
```

```ts [After]
import { backButton } from '@tma.js/sdk';

const unsubscribe = backButton.isVisible.subscribe((next, prev) => {
  console.log(next);
});
unsubscribe();

const unsubscribeOnce = backButton.isVisible.subscribe(isVisible => {
  unsubscribeOnce();
  console.log('Called once:', isVisible);
});
```

:::

The listener still receives the next and the previous values, is called only when the value
changes, and is not called on subscribe.

::: warning
Objects and arrays returned by computed values are now frozen and typed as `DeepReadonly`.
Assigning their properties directly is a compilation error, but TypeScript allows passing them
where a mutable type is expected, e.g. to `Object.assign` or your own function changing its
argument. Such code compiles and throws `TypeError` at runtime. Copy values before changing them:

```ts
import { viewport } from '@tma.js/sdk';

const insets = { ...viewport.safeAreaInsets(), top: 0 };
```
:::

The SDK no longer exports a way to create your own reactive values. If you built computed values
on top of SDK signals using `computed` from `@tma.js/signals`, use a third-party reactivity
library or your framework's primitives, subscribing to SDK values with `subscribe`.

In framework bindings, `useSignal` was replaced with `useComputed`. It accepts only computed
values of the SDK:

::: code-group

```tsx [Before]
import { backButton, useSignal } from '@tma.js/sdk-react';

const isVisible = useSignal(backButton.isVisible);
```

```tsx [After]
import { backButton, useComputed } from '@tma.js/sdk-react';

const isVisible = useComputed(backButton.isVisible);
```

:::

## Error Handling

### `xFp` Functions

All `xFp` functions were replaced with `safeX` functions. Instead of `Either` or `TaskEither`,
they return a result object (or a promise of it):

```ts
type Result<E, T> = { ok: false; error: E } | { ok: true; data: T };
```

::: code-group

```ts [Before]
import { popup } from '@tma.js/sdk';
import { taskEither as TE, function as fn } from 'fp-ts';

await fn.pipe(
  popup.showFp({ message: 'Hello!' }),
  TE.match(
    error => console.error(error),
    buttonId => console.log(buttonId),
  ),
)();
```

```ts [After]
import { popup } from '@tma.js/sdk';

const result = await popup.safeShow({ message: 'Hello!' });
if (result.ok) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

:::

The `matchError` function, exported from the SDK, handles each error type separately and fails
compilation if some of them are left unhandled:

```ts
import { matchError, popup } from '@tma.js/sdk';

const result = await popup.safeShow({ message: 'Hello!', timeout: 10_000 });
if (!result.ok) {
  matchError(result.error, {
    InvalidArgumentsError: e => console.error(e.message),
    TimeoutError: e => console.error('Timed out after', e.data.timeout),
  });
}
```

The `ok`, `err`, `unwrap` and `throwing` helpers from the bridge are re-exported too.

Not every function has a safe version. Functions without expected errors, like `hideKeyboard`,
`shareStory`, `shareURL`, `switchInlineQuery` and `addToHomeScreen`, have only the throwing
version.

::: warning
Safe functions return only *expected* errors, like a timeout, the user's refusal or invalid
arguments. Errors caused by incorrect usage or a wrong environment are always thrown, even by
safe functions: `NotInitializedError`, `NotMountedError`, `MethodUnsupportedError`,
`MethodParameterUnsupportedError`, `ConcurrentCallError`, `CSSVarsBoundError` and
`InvalidEnvError`. For asynchronous functions, the returned promise is rejected.

In particular, `ConcurrentCallError` (opening a popup, an invoice or the QR scanner while it is
already opened) and `InvalidEnvError` (calling a serverless endpoint without init data) were
returned as errors in 3.x and are thrown now.
:::

### Promises and Cancellation

Asynchronous functions return a regular `Promise` instead of `BetterPromise`. The `abortSignal`
option was renamed to `signal`, and the `.cancel()` method was removed:

::: code-group

```ts [Before]
import { popup } from '@tma.js/sdk';

const promise = popup.show({ message: 'Hello!', timeout: 10_000 });
promise.cancel();
```

```ts [After]
import { popup } from '@tma.js/sdk';

const controller = new AbortController();
const promise = popup.show({
  message: 'Hello!',
  timeout: 10_000,
  signal: controller.signal,
});
controller.abort();
```

:::

When the signal is aborted, the promise is rejected with `signal.reason`. `CancelledError` was
removed.

::: warning
`TimeoutError` is now a class of `@tma.js/bridge`, not of `better-promises`. Checks like
`e instanceof TimeoutError` with the class imported from `better-promises` no longer work. Use
`TimeoutError.is(e)` with the class imported from `@tma.js/sdk`. The timeout is available in
`e.data.timeout`.
:::

### Error Classes

| 3.x                                                          | Current major version                                                     |
|--------------------------------------------------------------|---------------------------------------------------------------------------|
| `FunctionUnavailableError` (name `FunctionNotAvailableError`) | Removed. Replaced with `NotInitializedError`, `NotMountedError`, `MethodUnsupportedError` and `MethodParameterUnsupportedError` |
| `NotAvailableError`                                          | `BiometryUnavailableError`                                                |
| `ValidationError`                                            | `InvalidResponseError`. The value is in `.data.value`, the validation error is in `cause` |
| `ServerlessError(message, { status, type, parameters, cause })` | `ServerlessError(message, { status, type, parameters }, cause)`       |
| `UnknownThemeParamsKeyError`                                 | Added `.data.key`                                                         |
| `SetEmojiStatusError`, `ShareMessageError`, `RequestChatError`, `FullscreenFailedError` | Added `.data.error`. Messages got a prefix  |
| `CancelledError`                                             | Removed. Aborted operations are rejected with `signal.reason`             |
| —                                                            | New: `NotInitializedError`, `NotMountedError` (`.data.component`), `InvalidColorError` |

Per-function error unions were removed: `OpenLinkError`, `OpenTelegramLinkError`,
`ShareURLError`, `SendDataError`, `DownloadFileError`, `GetCurrentTimeError`,
`HideKeyboardError`, `ReadTextFromClipboardError`, `RequestChatFnError`, `ShareMessageFnError`,
`ShareStoryError`, `SwitchInlineQueryError`, `RequestPhoneAccessError` and
`RequestWriteAccessError`. The kept ones are `CloudStorageError`, `DeviceStorageError`,
`SecureStorageError`, `RequestContactError` and `ServerlessCallError`.

All error classes have the static `is` method. It works even if the package is duplicated in the
bundle:

```ts
import { NotMountedError } from '@tma.js/sdk';

if (NotMountedError.is(e)) {
  console.error(e.data.component, 'is not mounted');
}
```

## Mounting

| 3.x                                                       | Current major version                                               |
|-----------------------------------------------------------|---------------------------------------------------------------------|
| Asynchronous `mount` returned `BetterPromise`, `mountFp` returned `TaskEither` | `mount` returns `Promise`, `safeMount` returns a result with `TimeoutError` |
| No way to know if the component is mounting               | `isMounting` computed value (`viewport`, `biometry`, `locationManager`) |
| `viewport` had no `unmount`                               | `viewport.unmount()`                                                |
| Calling a method of an unmounted component returned `FunctionUnavailableError` | Throws `NotMountedError`                           |

::: warning
Behavior changes:

- The state saved before the page reload is restored only on the first mount after the reload.
  Previously, it was restored on every mount.
- Calling `unmount` while an asynchronous mount is in progress cancels it. Previously, the
  component got mounted when the request completed.
- The component state is saved in `sessionStorage` under the `tma.js/sdk/<component>` keys
  instead of `tapps/<component>`. The state saved by 3.x is not restored after the update. This
  matters only if the page is reloaded within the same session during the update rollout.
- `miniApp.mount()` mounts `themeParams` too, if it is not mounted yet.
:::

## Component Changes

### Buttons

Changes in `backButton`, `settingsButton`, `mainButton` and `secondaryButton`:

- `onClick(listener, once?)` became `onClick(listener, { once?, signal? })`.
- `offClick(listener, once?)` became `offClick(listener)`.
- `onClick` and `offClick` never throw and don't require `init`.
- All `*Fp` methods were removed.

::: code-group

```ts [Before]
import { backButton } from '@tma.js/sdk';

backButton.onClick(listener, true);
backButton.offClick(listener, true);
```

```ts [After]
import { backButton } from '@tma.js/sdk';

backButton.onClick(listener, { once: true });
backButton.offClick(listener);
```

:::

### Main and Secondary Buttons

- Both buttons are described by the shared `BottomButton<S>` interface. Their state types are
  `MainButtonState` and `SecondaryButtonState`.
- `mainButton.isSupported()` was added.
- `setParams.supports('hasShineEffect' | 'iconCustomEmojiId')` was added.
- `enableShineEffect`, `disableShineEffect` and `setIconCustomEmojiId` have their own
  `isSupported` method.
- `iconCustomEmojiId()` returns `string | undefined`. Previously, it returned `''` when not set.

::: warning
- Parameters that were not set, like the colors or the custom emoji identifier, are no longer
  sent to the Telegram client. Previously, an empty `icon_custom_emoji_id` was always sent.
- Passing `iconCustomEmojiId` before Mini Apps v9.5 throws `MethodParameterUnsupportedError`
  with the default `postEvent`.
- The default `secondaryButton.bgColor()` is now `miniApp.bottomBarColorRgb()`, then
  `themeParams.secondaryBgColor()`, then `#ffffff`. Previously, it fell back to `#000000`.
:::

### Closing Behavior and Swipe Behavior

- `closingBehavior.isSupported()` was added.
- `*Fp` methods were removed.

### Mini App

- New methods: `safeSetBgColor`, `safeSetBottomBarColor` and `safeSetHeaderColor` returning
  `UnknownThemeParamsKeyError`.
- `setBgColor`, `setBottomBarColor` and `setHeaderColor` have their own `isSupported` method.
- `close.supports('returnBack')` was added.
- Colors are parsed with `toRGB`, so the `#RGB`, `#RGBA`, `#RRGGBBAA`, `rgb()` and `rgba()`
  formats are accepted and converted to `#RRGGBB`.
- The `MiniAppGetCssVarNameFn` type was removed. The `AnyColor` type is exported.

::: warning
- Before mounting, `isActive()` returns `true`. Previously, it returned `false`.
- After mounting, `headerColor()` is `'bg_color'`, as in the official SDK. Previously, it was
  `'header_bg_color'`.
- The bottom bar color with the default `bottom_bar_bg_color` key falls back to the
  `secondary_bg_color` theme color, like in the official SDK.
- `isDark()` returns `false` if the background color is unknown or invalid.
- `close(false)` sends empty parameters instead of `{ return_back: false }`.
:::

### Theme Params

- The component interface is now called `ThemeParamsComponent`. The `ThemeParams` name refers to
  the theme parameters data type. See [Type Renames](#type-renames).
- The `ThemeParamsState` and `ThemeParamsGetCssVarNameFn` types were removed. Use `ThemeParams`.
- Unbinding CSS variables now removes them. Previously, they stayed set.

::: warning
- `isDark()` returns `false` if the theme has no `bg_color`. Previously, it returned `true`.
- The `theme_changed` event replaces the whole state. Previously, new values were merged with the
  old ones, so colors missing in the new theme kept their old values.
:::

### Viewport

- `safeAreaInsetTop`, `safeAreaInsetBottom`, `safeAreaInsetLeft`, `safeAreaInsetRight` and the
  same `contentSafeAreaInset*` values were removed. Use `safeAreaInsets()` and
  `contentSafeAreaInsets()`. The related CSS variables are still created by `bindCssVars`.
- New: `safeMount`, `isMounting`, `unmount`, `safeRequestFullscreen` and `safeExitFullscreen`.
- `requestFullscreen` and `exitFullscreen` have their own `isSupported` method.
- The state has the new `isStable` property.

::: code-group

```ts [Before]
import { viewport } from '@tma.js/sdk';

viewport.safeAreaInsetTop();
```

```ts [After]
import { viewport } from '@tma.js/sdk';

viewport.safeAreaInsets().top;
```

:::

::: warning
- `viewport.bindCssVars()` now throws `NotMountedError` if the component is not mounted.
- `isStable()` is now taken from the `is_state_stable` flag sent by Telegram. Previously, it was
  computed as `height() === stableHeight()`, so it returned `true` when the height being changed
  matched the last stable height, e.g. while the user was dragging the mini app.
:::

### Init Data

- The component interface is now called `InitDataComponent`. The `InitData` name refers to the
  init data type. See [Type Renames](#type-renames).
- `restoreFp` was replaced with `safeRestore`, returning `InvalidInitDataError` if init data is
  invalid.
- Init data is parsed with [@tma.js/init-data](../tma-js-init-data.md). Unknown keys are
  removed, `signature` is optional.

::: warning
`initData.restore()` now reads init data from the launch parameters passed to (or retrieved by)
`init`. Previously, it retrieved launch parameters itself and worked without `init`.
:::

### Haptic Feedback

- `impactOccurredFp`, `notificationOccurredFp` and `selectionChangedFp` were removed.
- `isSupported` became a regular function.

### Biometry

- `state().token` was removed. The token is returned only by `authenticate`.
- `NotAvailableError` was replaced with `BiometryUnavailableError`.
- New: `safeMount`, `isMounting`, `safeAuthenticate`, `safeRequestAccess` and `safeUpdateToken`.
- `BiometryAuthenticateOptions` and `BiometryRequestAccessOptions` were replaced with
  `BiometryReasonOptions`. `BiometryAuthenticateResult` was added. `reason` and `token` no longer
  accept `null`.
- `updateToken` updates `state().tokenSaved`.

::: warning
- `requestAccess()` resolves with `true` if the access was **granted**. In 3.x, it mistakenly
  resolved with the `accessRequested` value.
- Calling `authenticate`, `requestAccess` or `updateToken` while another of these requests is in
  progress throws `ConcurrentCallError`.
:::

### Location Manager

- `LocationManagerRequestLocationResponse` was renamed to `LocationData`.
- New: `safeMount`, `isMounting` and `safeRequestLocation`.
- After mounting, the state is updated on each `location_checked` event.

### Popup

- `ShowOptions` was renamed to `PopupShowOptions`, `ShowOptionsButton` to `PopupShowButton`.
- `showFp` was replaced with `safeShow`, returning `InvalidArgumentsError` or `TimeoutError`.
- The `preparePopupParams` function validating popup parameters is exported.

### Invoice

- `openSlugFp` and `openUrlFp` were replaced with `safeOpenSlug` and `safeOpenUrl`.
- An invalid URL passed to `openUrl` results in `InvalidArgumentsError`. Previously, a
  `TypeError` was thrown.

### QR Scanner

- `openFp` and `captureFp` were replaced with `safeOpen` and `safeCapture`.
- The `capture` option of `capture` became optional. By default, the first scanned QR code is
  captured, so `qrScanner.capture()` can be called without arguments.
- The `QrScannerOpenOptions` and `QrScannerCaptureOptions` types are exported.

::: warning
When the timeout is reached or the operation is aborted, the scanner is closed. Previously, it
stayed opened.
:::

### Cloud Storage

- The `getItem(keys[])` overload was removed. Use `getItems`.
- `*Fp` methods were replaced with `safe*` methods returning `CloudStorageError`.
- Methods accept `{ timeout?, signal? }` options.

::: code-group

```ts [Before]
const values = await cloudStorage.getItem(['a', 'b']);
```

```ts [After]
const values = await cloudStorage.getItems(['a', 'b']);
```

:::

### Device Storage and Secure Storage

- `isSupported()` was added.
- Methods accept `{ timeout?, signal? }` options as the last argument.
- `*Fp` methods were replaced with `safe*` methods. Errors are `DeviceStorageMethodError |
  TimeoutError` and `SecureStorageMethodError | TimeoutError`.
- The `SecureStorageItem` type describing the `secureStorage.getItem` result is exported.

### Serverless

- `callFp` was replaced with `safeCall`.
- The `abortSignal` option was renamed to `signal`.
- `ServerlessCallError` no longer includes `InvalidEnvError`.

::: warning
If the launch parameters have no init data, `call` and `safeCall` throw `InvalidEnvError`.
Previously, `callFp` returned it as an error.
:::

## Function Changes

All `xFp` functions were replaced with `safeX` functions, and every function got the
`isSupported` method:

| 3.x                           | Current major version            |
|-------------------------------|----------------------------------|
| `addToHomeScreenFp`           | Removed, use `addToHomeScreen`   |
| `checkHomeScreenStatusFp`     | `safeCheckHomeScreenStatus`      |
| `downloadFileFp`              | `safeDownloadFile`               |
| `getCurrentTimeFp`            | `safeGetCurrentTime`             |
| `hideKeyboardFp`              | Removed, use `hideKeyboard`      |
| `openLinkFp`                  | `safeOpenLink`                   |
| `openTelegramLinkFp`          | `safeOpenTelegramLink`           |
| `readTextFromClipboardFp`     | `safeReadTextFromClipboard`      |
| `requestChatFp`               | `safeRequestChat`                |
| `requestContactFp`            | `safeRequestContact`             |
| `requestContactCompleteFp`    | `safeRequestContactComplete`     |
| `requestEmojiStatusAccessFp`  | `safeRequestEmojiStatusAccess`   |
| `requestPhoneAccessFp`        | `safeRequestPhoneAccess`         |
| `requestWriteAccessFp`        | `safeRequestWriteAccess`         |
| `sendDataFp`                  | `safeSendData`                   |
| `setEmojiStatusFp`            | `safeSetEmojiStatus`             |
| `shareMessageFp`              | `safeShareMessage`               |
| `shareStoryFp`                | Removed, use `shareStory`        |
| `shareURLFp`                  | Removed, use `shareURL`          |
| `switchInlineQueryFp`         | Removed, use `switchInlineQuery` |

Other changes:

- `openLink.supports('tryInstantView' | 'tryBrowser')` was added.
- `switchInlineQuery` throws `InvalidEnvError` if the app was not launched in inline mode, and its
  `isSupported` returns `false` in this case. The inline mode is taken from the
  `tgWebAppBotInline` launch parameter.
- `requestContact` and `requestContactComplete`: the `RequestedContactCompleteData` type was
  renamed to `RequestedContactComplete`, the timeout now applies to the whole operation, and
  responses of Telegram for macOS are handled correctly.
- `getCurrentTime` returns `InvalidResponseError` instead of `ValidationError`.
- New exports: `isTelegramHostname` and `preparePopupParams`.

## Colors

| 3.x                                                   | Current major version                         |
|-------------------------------------------------------|-----------------------------------------------|
| `isColorDark`, `isColorDarkFp`                        | `isColorDark`, `safeIsColorDark`              |
| `toRGB`, `toRGBFp`                                    | `toRGB`, `safeToRGB`, error `InvalidColorError` |
| `isRGB`                                               | `isRGB`                                       |
| `toRGBFull`, `toRGBFullFp`                            | Removed                                       |
| `isRGBShort`, `isRGBA`, `isRGBAShort`, `isAnyRGB`     | Removed                                       |

`toRGB` accepts the `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`, `rgb()` and `rgba()` formats and
always returns `#RRGGBB`: the alpha channel is dropped. There is no conversion to `#RRGGBBAA`
anymore.

## Type Renames

Some names now mean something different:

| Name             | 3.x                      | Current major version                                      |
|------------------|--------------------------|------------------------------------------------------------|
| `InitData`       | Component class          | Init data type. The component interface is `InitDataComponent` |
| `ThemeParams`    | Component class          | Theme parameters type. The component interface is `ThemeParamsComponent` |
| `TimeoutError`   | Class of `better-promises` | Class of `@tma.js/bridge`                                |
| `isSupported`    | Reactive signal          | Regular function                                           |

::: code-group

```ts [Before]
import type { InitDataType, ThemeParamsType } from '@tma.js/sdk';
```

```ts [After]
import type { InitData, ThemeParams } from '@tma.js/sdk';
```

:::

Other type changes:

| 3.x                                                     | Current major version                     |
|---------------------------------------------------------|-------------------------------------------|
| `InitDataType`                                          | `InitData`                                |
| `ThemeParamsType`, `ThemeParamsState`                   | `ThemeParams`                             |
| `AsyncOptions` (`{ abortSignal?, timeout? }`)           | `AsyncOptions` (`{ signal?, timeout? }`)  |
| `LocationManagerRequestLocationResponse`                | `LocationData`                            |
| `ShowOptions`, `ShowOptionsButton`                      | `PopupShowOptions`, `PopupShowButton`     |
| `BiometryAuthenticateOptions`, `BiometryRequestAccessOptions` | `BiometryReasonOptions`             |
| `RequestedContactCompleteData`                          | `RequestedContactComplete`                |
| `RetrieveLaunchParamsResult`                            | `LaunchParams`                            |
| `KnownThemeParamsKey`                                   | Removed                                   |
| `MiniAppGetCssVarNameFn`, `ThemeParamsGetCssVarNameFn`  | Removed                                   |

New types: `Computed`, `DeepReadonly`, `IsSupported`, `Supports`, `WithIsSupported`, `WithSupports`,
`StatefulComponent`, `MountableComponent`, `ButtonComponent`, `BottomButton`,
`BottomButtonState`, `BottomButtonFeature`, `AnyColor`, `ViewportCSSVarKey`,
`BiometryAuthenticateResult`, `CloudStorageError`, `SecureStorageItem`, `QrScannerOpenOptions`
and `QrScannerCaptureOptions`.

::: warning
The `tgWebAppData` launch parameter is now the raw init data string, not a parsed object. Use the
`initData` component or the `parse` function of [@tma.js/init-data](../tma-js-init-data.md) to
get the parsed value.
:::

## Bridge Re-exports

The SDK now re-exports everything from `@tma.js/bridge`. Notable changes of the re-exported API:

- `on` and `off` were renamed to `onEvent` and `offEvent`. Listening to all events is done with
  `onAnyEvent` and `offAnyEvent`.
- `retrieve*Fp`, `requestFp`, `invokeCustomMethodFp` and other `*Fp` functions were replaced with
  `safe*` functions.
- `request2` was renamed to `request`.
- `debug`, `targetOrigin` and `logger` signals were replaced with `isDebug`, `getTargetOrigin` and
  `getLogger` functions.
- `isTMA('complete')` was replaced with `isTMAAsync`.
- `mockTelegramEnv` accepts the `onMethod` option instead of `onEvent`.
- `parseLaunchParamsQuery` and `serializeLaunchParamsQuery` were replaced with
  `parseLaunchParams` and `serializeLaunchParams`.
- `applyPolyfills`, `createLogger`, `deepSnakeToCamelObjKeys` and `CancelledError` were removed.

::: warning
In 3.x, the SDK exported its own `postEvent`, `request`, `request2` and `invokeCustomMethod`
wrappers using the `postEvent` function configured in `init`. Now these names are re-exported
from the bridge directly and don't use the `postEvent` passed to `init`, so they don't check if
methods are supported. Pass the function explicitly if needed:

```ts
import { createPostEvent, request, retrieveLaunchParams } from '@tma.js/sdk';

const postEvent = createPostEvent(retrieveLaunchParams().tgWebAppVersion);
await request('web_app_request_phone', 'phone_requested', { postEvent });
```

Also, `request` called with an array of events now always resolves with `{ event, payload }`,
like `request2` did. Previously, `request` resolved with the payload only.
:::

Learn more in the [bridge migration guide](../tma-js-bridge/migrate-from-v2.md).
