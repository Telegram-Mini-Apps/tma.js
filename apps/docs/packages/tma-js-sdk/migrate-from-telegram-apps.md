# Migrating from @telegram-apps/sdk

This guide provides a summary of the migration process from `@telegram-apps/sdk` to the current
major version of `@tma.js/sdk`.

Before reading this document, it is recommended to first learn more about the migration process
related to [@tma.js/bridge](../tma-js-bridge/migrate-from-telegram-apps.md) as you probably used
some functionality from it. The SDK re-exports the whole bridge, so its changes apply here too.

::: tip
`@tma.js/sdk` 3.x was the direct successor of `@telegram-apps/sdk`. The current major version
changed the API once more, so most of the changes described in the
[Migrating from 3.x](./migrate-from-v3.md) guide apply to you as well: availability checks,
reactivity, error handling and others. This page covers only the differences specific to
`@telegram-apps/sdk`.
:::

## Loggers

The `bridgeLogger` variable and `BridgeLogger` type have been removed. Use the `getLogger` and
`setLogger` functions and the `Logger` type instead.

```ts
import { setLogger } from '@tma.js/sdk';

setLogger({
  log: (...args) => console.log('[tma.js]', ...args),
  warn: (...args) => console.warn('[tma.js]', ...args),
  error: (...args) => console.error('[tma.js]', ...args),
});
```

## Component-related Functions and Variables Removed

`@tma.js/sdk` has moved away from this approach as it was quite difficult to support and didn't
provide significant benefits. Previously used component-related functions and variables such as
`showBackButton`, `hideBackButton`, `isBackButtonVisible`, and others should now be replaced with
their component counterparts.

So, having this code:

```ts
import {
  showBackButton,
  hideBackButton,
  isBackButtonVisible,
} from '@telegram-apps/sdk';

showBackButton();
isBackButtonVisible(); // true

hideBackButton();
isBackButtonVisible(); // false
```

You should update it to this one:

```ts
import { backButton } from '@tma.js/sdk';

backButton.show();
backButton.isVisible(); // true

backButton.hide();
backButton.isVisible(); // false
```

## Errors

We have removed functions responsible for determining if a value is a specific error. Previously,
you could use them like this:

```ts
import { isTimeoutError } from '@telegram-apps/sdk';

if (isTimeoutError(value)) {
  // value is TimeoutError.
}
```

Now, every error class has the static `is` method:

```ts
import { TimeoutError } from '@tma.js/sdk';

if (TimeoutError.is(value)) {
  // value is TimeoutError.
}
```

## Availability Checks

The `isAvailable` and `ifAvailable` methods were removed. Use the `isSupported` method instead.
It returns `true` if the SDK is initialized and the Telegram client supports the feature:

```ts
import { invoice } from '@tma.js/sdk';

if (invoice.isSupported()) {
  const status = await invoice.openSlug('abc');
}
```

Calling an unsupported function throws `MethodUnsupportedError`. Learn more in the
[Features](./features.md#checking-support) section.

## Reactive Values

Component signals were replaced with [computed values](./features.md#computed-values). Call one to
get the current value, and use the `subscribe` method to track its changes:

```ts
import { backButton } from '@tma.js/sdk';

backButton.isVisible(); // false

const unsubscribe = backButton.isVisible.subscribe((next, prev) => {
  console.log(prev, '->', next);
});
```

## `init`

The function options were updated. There is no longer a need to pass a complete set of launch
parameters. Here is the list of all options:

```ts
interface InitOptions {
  /**
   * Apply styles sent by Telegram Web clients.
   * @default true
   */
  acceptCustomStyles?: boolean;
  /**
   * Launch parameters to use.
   * @default Launch parameters retrieved with the `retrieveLaunchParams` function.
   */
  launchParams?: LaunchParams;
  /**
   * Function calling Mini Apps methods.
   * @default A function created with `createPostEvent` for the current Mini Apps version.
   */
  postEvent?: PostEventFn;
}
```

Learn more in the [Initializing](./initializing.md) section.

## `Biometry`

- `requestBiometry` has been removed. Use the `request` function to achieve the same
  functionality:

  ```ts
  import { request } from '@tma.js/sdk';

  const info = await request('web_app_biometry_get_info', 'biometry_info_received');
  ```

- `mountError` and `mountPromise` have been removed. `mount` returns a promise, `isMounting` is
  a computed value.

## `Invoice`

- The `open` method was replaced with separate `openUrl` and `openSlug` methods.
- `openError` and `openPromise` have been removed.

## `LocationManager`

- `requestLocation` may now return `null` if there is no access to the location.

## `MainButton`

- The `backgroundColor` signal name was shortened to `bgColor`.

## `ThemeParams`

- Some value names were shortened:
  - `backgroundColor` → `bgColor`
  - `headerBackgroundColor` → `headerBgColor`
  - `secondaryBackgroundColor` → `secondaryBgColor`
  - `sectionBackgroundColor` → `sectionBgColor`
- `mountSync` was removed. `mount` is now synchronous.

## `CloudStorage`

- The `getItem` method no longer accepts a list of keys.
- The `getItems` method is now used to get values of several keys.

## `Popup`

- The `show` method now returns `string | undefined` instead of `string | null`.

## `QrScanner`

- The `open` method was divided into `open` and `capture`. The `open` method allows capturing
  multiple QR codes, while the `capture` method is responsible for capturing a single QR code.
  [Learn more](./features/qr-scanner.md)

## `Viewport`

- Static methods `requestContentSafeAreaInsets`, `requestViewport`, and `requestSafeAreaInsets`
  have been removed. You can use the `request` function to achieve the same functionality:

  ```ts
  import { request } from '@tma.js/sdk';

  const insets = await request('web_app_request_safe_area', 'safe_area_changed');
  ```

- Values for each side of the insets, like `safeAreaInsetTop`, have been removed. Use
  `safeAreaInsets().top` and `contentSafeAreaInsets().top` instead.

## `InitData`

- Values such as `chat`, `receiver`, and `user` now return objects as they are presented in the
  init data, with snake_case keys instead of camelCase.

## `MiniApp`

- Values and methods renamed:
  - `backgroundColor` → `bgColor`
  - `backgroundColorRGB` → `bgColorRgb`
  - `bottomBarColorRGB` → `bottomBarColorRgb`
  - `headerColorRGB` → `headerColorRgb`
  - `setBackgroundColor` → `setBgColor`
  - `setBottomColor` → `setBottomBarColor`

## `.supports()`

The functions' `supports` field is now a function that accepts an option name, rather than an
object. You should rewrite this code:

```ts
import { miniApp } from '@telegram-apps/sdk';

if (miniApp.setHeaderColor.supports.rgb()) {
  miniApp.setHeaderColor('#aabbcc');
}
```

Into this one:

```ts
import { miniApp } from '@tma.js/sdk';

if (miniApp.setHeaderColor.supports('rgb')) {
  miniApp.setHeaderColor('#aabbcc');
}
```

## Utilities

- Functions `onAddToHomeScreenFailed`, `offAddToHomeScreenFailed`, `onAddedToHomeScreen` and
  `offAddedToHomeScreen` were removed. Use the `onEvent` and `offEvent` functions instead:

  ```ts
  import { onEvent } from '@tma.js/sdk';

  const off = onEvent('home_screen_added', () => {
    console.log('Added to the home screen');
  });
  ```
