---
outline: [2, 3]
---

# @telegram-apps/sdk-react

<p style="display: inline-flex; gap: 8px">
  <a href="https://npmjs.com/package/@telegram-apps/sdk-react">
    <img src="https://img.shields.io/npm/v/@telegram-apps/sdk-react?logo=npm"/>
  </a>
  <img src="https://img.shields.io/bundlephobia/minzip/@telegram-apps/sdk-react"/>
  <a href="https://github.com/Telegram-Mini-Apps/telegram-apps/tree/master/packages/sdk-react">
    <img src="https://img.shields.io/badge/source-black?logo=github"/>
  </a>
</p>

React JS bindings for [client SDK](telegram-apps-sdk). Includes hooks, components and utilities
for comfortable usage of React JS on the Telegram Mini Apps platform.

## Installation

Before anything else, it is assumed that you have already installed the `react` package, as it is
a peer dependency of this package.

::: code-group

```bash [pnpm]
pnpm i @telegram-apps/sdk-react
```

```bash [npm]
npm i @telegram-apps/sdk-react
```

```bash [yarn]
yarn add @telegram-apps/sdk-react
```

:::

## SDKProvider

`SDKProvider` is a component responsible for providing the SDK functionality. It accepts
such properties as `acceptCustomStyles: boolean` and `debug: boolean`. Both of them are optional.

The `acceptCustomStyles` property is responsible for accepting custom styles from the web version of
Telegram.

The `debug` property is responsible for enabling a debug mode.

```jsx
import { SDKProvider } from '@telegram-apps/sdk-react';

/**
 * Root component for the whole project.
 */
export function Root() {
  return (
    <SDKProvider acceptCustomStyles debug>
      <div>My application!</div>
    </SDKProvider>
  );
}
```

## Hooks

For better understanding, each component hook uses its own component-related init function. If the
init function returns a non-promise value, the hook will instantly retrieve it. If the init function
is asynchronous, the hook will return an `undefined` value while the component is still
initializing. Then, it will be updated to the initialized value.

All component hooks in this package are divided into two parts:

1. Retrieving the actual init function value. These hooks are non-suffixed, like `useBackButton`.
2. Retrieving a meta item related to the init function value. These hooks include a suffix such
   as `Raw`, like `useBackButtonRaw`.

The first category of hooks returns the actual init function value. They throw an error if something
goes wrong during component initialization.

The second category of hooks returns an object containing the initialization process information.
Here is the object shape:

```ts
export interface SDKContextItem<T> {
  /**
   * This item execution result. The property may be missing
   * in case the execution is async.
   */
  result?: T;
  /**
   * Function to clean up item side effects.
   */
  cleanup?(): void;
  /**
   * An error occurred during execution.
   */
  error?: unknown;
}
```

Using the second category of hooks, you can extract an error without throwing it.

Here is the complete usage example:

```ts
import {
  useBackButton,
  useBackButtonRaw,
  useViewport,
  useViewportRaw,
  useBiometryManagerRaw,
} from '@telegram-apps/sdk-react';
import { useEffect } from 'react';

// BackButton initializes synchronously. So, bb will be 
// the BackButton instance.
const bb = useBackButton();

// Viewport is being initialized asynchronously, so signal may return undefined.
// After some time it will receive a valid value.
const vp = useViewport();

useEffect(() => {
  console.log(vp); // will be undefined and then Viewport instance.
}, [vp]);

const bm = useBiometryManagerRaw();

useEffect(() => {
  if (bm.error) {
    console.error('Something went wrong for BiometryManager', bm.error);
  }
}, [bm]);
```

### SSR

This package also supports SSR mode, widely used in popular frameworks like Next.js. When using
package hooks on the server side, you must pass `true` as the first argument. This notifies the hook
that server-side mode is enabled. Not specifying this value and calling the hook on the server side
will lead to an error.

Server-side mode returns `undefined` for each component hook on the server side and also before the
current component is mounted. This is required for persistence between trees rendered on the server
and client sides.

```ts
import { useBackButton } from '@telegram-apps/sdk-react';
import { useEffect } from 'react';

function Component() {
  const bb = useBackButton(true); // will be undefined or BackButton.

  useEffect(() => {
    if (bb) {
      // Here we can safely work with the BackButton.
    }
  }, [bb]);
}
```

### HOCs

All package Higher Order Components utilize the hooks described previously. The usage is rather
simple:

```ts
import { withBackButton } from '@telegram-apps/sdk-react';
import { useEffect } from 'react';

const A = withBackButton('bb', false, ({ bb }) => {
  useEffect(() => {
    bb.show();
  }, [bb]);
  return null;
});

const B = withBackButton('bb', true, ({ bb }) => {
   useEffect(() => {
      bb && bb.show();
   }, [bb]);
   return null;
});
```

As the first argument, you must pass a value responsible for the component property name receiving a
hook result. The second argument is SSR flag mode, which will be passed to the hook, used 
internally.

## Hooks and HOCs List

| Hook and HOC (Raw)                                | Hook and HOC (Result)                       | Returned value                                                              |
|---------------------------------------------------|---------------------------------------------|-----------------------------------------------------------------------------|
| `useBackButtonRaw`, `withBackButtonRaw`           | `useBackButton`, `withBackButton`           | [BackButton](telegram-apps-sdk/components/back-button.md)                          |
| `useBiometryManagerRaw`, `withBiometryManagerRaw` | `useBiometryManager`, `withBiometryManager` | [BiometryManager](telegram-apps-sdk/components/biometry-manager.md) or `undefined` |
| `useClosingBehaviorRaw`, `withClosingBehaviorRaw` | `useClosingBehavior`, `withClosingBehavior` | [ClosingBehavior](telegram-apps-sdk/components/closing-behavior.md)                |
| `useCloudStorageRaw`, `withCloudStorageRaw`       | `useCloudStorage`, `withCloudStorage`       | [CloudStorage](telegram-apps-sdk/components/cloud-storage.md)                      |
| `useHapticFeedbackRaw`, `withHapticFeedbackRaw`   | `useHapticFeedback`, `withHapticFeedback`   | [HapticFeedback](telegram-apps-sdk/components/haptic-feedback.md)                  |
| `useInitDataRaw`, `withInitDataRaw`               | `useInitData`, `withInitData`               | [InitData](telegram-apps-sdk/components/init-data.md)                              |
| `useInvoiceRaw`, `withInvoiceRaw`                 | `useInvoice`, `withInvoice`                 | [Invoice](telegram-apps-sdk/components/invoice.md)                                 |
|                                                   | `useLaunchParams`                           | [Launch params](telegram-apps-sdk/launch-parameters.md)                            |
| `useMainButtonRaw`, `withMainButtonRaw`           | `useMainButton`, `withMainButton`           | [MainButton](telegram-apps-sdk/components/main-button.md)                          |
| `useMiniAppRaw`, `withMiniAppRaw`                 | `useMiniApp`, `withMiniApp`                 | [MiniApp](telegram-apps-sdk/components/mini-app.md)                                |
| `usePopupRaw`, `withPopupRaw`                     | `usePopup`, `withPopup`                     | [Popup](telegram-apps-sdk/components/popup.md)                                     |
| `useQRScannerRaw`, `withQRScannerRaw`             | `useQRScanner`, `withQRScanner`             | [QRScanner](telegram-apps-sdk/components/qr-scanner.md)                            |
| `useSettingsButtonRaw`, `withSettingsButtonRaw`   | `useSettingsButton`, `withSettingsButton`   | [SettingsButton](telegram-apps-sdk/components/settings-button.md)                  |
| `useThemeParamsRaw`, `withThemeParamsRaw`         | `useThemeParams`, `withThemeParams`         | [ThemeParams](telegram-apps-sdk/components/theme-params.md)                        |
| `useUtilsRaw`, `withUtilsRaw`                     | `useUtils`, `withUtils`                     | [Utils](telegram-apps-sdk/components/utils.md)                                     |
| `useViewportRaw`, `withViewportRaw`               | `useViewport`, `withViewport`               | [Viewport](telegram-apps-sdk/components/viewport.md) or `undefined`                |

## Template

We have already created a [template](https://github.com/Telegram-Mini-Apps/reactjs-template) for
React JS that utilizes the current package, so you can use it.