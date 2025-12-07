# Migrating from @telegram-apps/sdk

This guide provides a summary of the migration process from `@telegram-apps/sdk` to `@tma.js/sdk`.

Before reading this document, it is recommended to first learn more about migration process related
to [@tma.js/bridge](../tma-js-bridge/migrate-from-telegram-apps.md) as you probably used some functionality from it.

## Loggers

The `bridgeLogger` variable and `BridgeLogger` type have been removed. You should now use `logger` and `Logger` if
needed.

## Component-related Functions and Variables Removed

`@tma.js/sdk` has moved away from this approach as it was quite difficult to support and didn't provide significant
benefits. Previously used component-related functions and variables such as `showBackButton`, `hideBackButton`,
`isBackButtonVisible`, and others should now be replaced with their component counterparts.

So, having this code:

```typescript
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

```typescript
import { backButton } from '@tma.js/sdk';

backButton.show();
backButton.isVisible(); // true

backButton.hide();
backButton.isVisible(); // false
```

## Errors

We have removed functions responsible for determining if a value is a specific error. Previously, you could use them
like this:

```typescript
import { isNotAvailableError } from '@telegram-apps/sdk';

if (isNotAvailableError(value)) {
  // value is NotAvailableError.
}
```

Now, you can achieve the same functionality with this code:

```typescript
import { NotAvailableError } from '@tma.js/sdk';

if (NotAvailableError.is(value)) {
  // value is NotAvailableError.
}
```

## `.ifAvailable()` Now Returns Object

Previously, functions' `ifAvailable` method returned a tuple: `[ok: true, value: something] | [ok: false]`. We've
updated it to return an object with `ok` and `data` fields for better clarity.

Here is an example:

```typescript
import { invoice } from '@tma.js/sdk';

console.log(invoice.openSlug.ifAvailable('abc'));
// Output:
// { ok: true, data: Promise<...> }
```

## `Biometry`

- `requestBiometry` has been removed. You can use the SDK's `request` method to achieve the same functionality.
- `isMounting`, `mountError`, and `mountPromise` have been removed.

## `Invoice`

- `openError` and `openPromise` have been removed.
- The `open` method was replaced with separate `openUrl` and `openSlug` methods.

## `LocationManager`

- `requestLocation` may now return `null` if there is no access to the location.

## `MainButton`

- The `backgroundColor` signal name was shortened to `bgColor`.

## `ThemeParams`

- Some signal names were shortened:
  - `backgroundColor` → `bgColor`
  - `headerBackgroundColor` → `headerBgColor`
  - `secondaryBackgroundColor` → `secondaryBgColor`
  - `sectionBackgroundColor` → `sectionBgColor`
- `mountSync` was removed.
- `mount` is now synchronous.

## `init`

The function options were updated. There is no longer a need to pass a complete set of launch parameters. Here is the
list of all options:

```typescript
interface InitOptions {
  /**
   * True if SDK should accept styles sent from the Telegram
   * application.
   * @default true
   */
  acceptCustomStyles?: boolean;
  /**
   * True if the application is launched in inline mode.
   * @default Will be calculated based on the launch parameters'
   * tgWebAppBotInline field.
   */
  isInlineMode?: boolean;
  /**
   * A custom `postEvent` function to use across the package.
   * @default tma.js/bridge's postEventFp function will be used.
   */
  postEvent?: PostEventFpFn;
  /**
   * Mini application theme parameters.
   * @default Will be calculated based on the launch parameters'
   * tgWebAppThemeParams field.
   */
  themeParams?: ThemeParams;
  /**
   * Telegram Mini Apps version supported by the Telegram
   * client.
   * @default Will be calculated based on the launch parameters'
   * tgWebAppVersion field.
   */
  version?: Version;
}
```

## `CloudStorage`

- The `getItem` method no longer accepts a list of keys.
- The `getItems` method is now used to get a list of keys.

## `Popup`

- The `show` method now returns `string | undefined` instead of `string | null`.

## `QrScanner`

- The `open` method was divided into `open` and `capture`. The `open` method allows capturing multiple QR-s, when
  the `capture` method is responsible for capturing a single QR. [Learn more](./features/qr-scanner.md)

## `Viewport`

- Static methods `requestContentSafeAreaInsets`, `requestViewport`, and `requestSafeAreaInsets` have been removed. You
  can use the SDK's `request` function to achieve the same functionality.

## `InitData`

- Signals such as `chat`, `receiver`, and `user` now return objects as they are presented in the init data—with
  snake_case keys instead of camelCase.

## `MiniApp`

- Signals and methods renamed:
  - `backgroundColor` → `bgColor`
  - `backgroundColorRGB` → `bgColorRgb`
  - `bottomBarColor` → `bottomBarBgColor`
  - `bottomBarColorRGB` → `bottomBarBgColorRgb`
  - `headerColorRGB` → `headerColorRgb`
  - `setBackgroundColor` → `setBgColor`
  - `setBottomColor` → `setBottomBarColor`

## `.supports()`

The functions' `supports` field is now a function that accepts an option name, rather than an object. You should rewrite
this code:

```typescript
import { miniApp } from '@telegram-apps/sdk';

if (miniApp.setHeaderColor.supports.rgb()) {
  miniApp.setHeaderColor('#aabbcc');
}
```

Into this one:

```typescript
import { miniApp } from '@tma.js/sdk';

if (miniApp.setHeaderColor.supports('rgb')) {
  miniApp.setHeaderColor('#aabbcc');
}
```

## Utilities

- Functions `onAddToHomeScreenFailed`, `offAddToHomeScreenFailed`, `onAddedToHomeScreen` and `offAddedToHomeScreen`
  were removed. Use SDK's `on` and `off` functions instead.
