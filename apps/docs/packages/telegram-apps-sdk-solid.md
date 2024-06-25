---
outline: [2, 3]
---

# @telegram-apps/sdk-solid

<p style="display: inline-flex; gap: 8px">
  <a href="https://npmjs.com/package/@telegram-apps/sdk-solid">
    <img src="https://img.shields.io/npm/v/@telegram-apps/sdk-solid?logo=npm"/>
  </a>
  <img src="https://img.shields.io/bundlephobia/minzip/@telegram-apps/sdk-solid"/>
  <a href="https://github.com/Telegram-Mini-Apps/telegram-apps/tree/master/packages/sdk-solid">
    <img src="https://img.shields.io/badge/source-black?logo=github"/>
  </a>
</p>

Solid JS bindings for [client SDK](telegram-apps-sdk). Includes hooks, components and utilities
for comfortable usage of Solid JS on the Telegram Mini Apps platform.

## Installation

Before anything else, it is assumed that you have already installed the `solid-js` package, as it is
a peer dependency of this package.

::: code-group

```bash [pnpm]
pnpm i @telegram-apps/sdk-solid
```

```bash [npm]
npm i @telegram-apps/sdk-solid
```

```bash [yarn]
yarn add @telegram-apps/sdk-solid
```

:::

## SDKProvider

`SDKProvider` is a component responsible for providing the SDK functionality. It accepts
such properties as `acceptCustomStyles: boolean` and `debug: boolean`. Both of them are optional.

The `acceptCustomStyles` property is responsible for accepting custom styles from the web version of
Telegram.

The `debug` property is responsible for enabling a debug mode.

```jsx
import { SDKProvider } from '@telegram-apps/sdk-solid';

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

Each component hook in this package returns a custom signal. The returned signal contains a
property `error?: unknown`, which will be set if something goes wrong during component
initialization. Calling a signal containing this property will lead to throwing a corresponding
error. If no error occurs, the signal will return a component instance.

For better understanding, each component hook uses its own component-related init function. If the
init function returns a non-promise value, the hook will instantly retrieve it. If the init function
is asynchronous, the hook will return a signal with an `undefined` value while the component is
still initializing. Then, it will be updated to the initialized value.

Here is an example:

```ts
import { useBackButton, useViewport } from '@telegram-apps/sdk-solid';

// BackButton initializes synchronously. So, bb will be a signal
// returning an instance of BackButton.
const bb = useBackButton();
const bbV = bb(); // will be BackButton

// Viewport is being initialized asynchronously, so signal may return undefined.
// After some time it will receive a valid value.
const vp = useViewport();
const vpV = vp(); // will be undefined

// ...after some time
const vpV2 = vp(); // will be Viewport
```

It is important to note that all properties of the components are reactive. So, if something changes
in a value returned from the hook signal, the signal itself will not be notified. This is because
the component itself did not change, but its property did.

Let's take a look at this example:

```ts
import { useViewport } from '@telegram-apps/sdk-solid';
import { createEffect } from 'solid-js';

// Let's assume that viewport is already initialized.
const vp = useViewport();

createEffect(() => {
  // This line of code will not be called if the viewport height 
  // or expansion state changes.
  console.log('Viewport changed', vp());
});

createEffect(() => {
  // But this line of code will be called every time the viewport
  // height changes.
  console.log('Viewport height changed', vp().height);
});
```

We have this granular reactivity to provide maximal performance, like Solid itself does.

## HOCs

All package Higher Order Components utilize the hooks described previously. The usage is rather
simple:

```ts
import { withBackButton } from '@telegram-apps/sdk-solid';

const MyComponent = withBackButton('bb', (props) => {
  createEffect(() => {
    props.bb().show();
  });
  return null;
});
```

As the first argument, you must pass a value responsible for the component property name receiving a
hook result. Note that the received value will be a signal, not the value behind it.

## Hooks and HOCs List

| Hook                 | HOC                   | Signal value                                                                |
|----------------------|-----------------------|-----------------------------------------------------------------------------|
| `useBackButton`      | `withBackButton`      | [BackButton](telegram-apps-sdk/components/back-button.md)                          |
| `useBiometryManager` | `withBiometryManager` | [BiometryManager](telegram-apps-sdk/components/biometry-manager.md) or `undefined` |
| `useClosingBehavior` | `withClosingBehavior` | [ClosingBehavior](telegram-apps-sdk/components/closing-behavior.md)                |
| `useCloudStorage`    | `withCloudStorage`    | [CloudStorage](telegram-apps-sdk/components/cloud-storage.md)                      |
| `useHapticFeedback`  | `withHapticFeedback`  | [HapticFeedback](telegram-apps-sdk/components/haptic-feedback.md)                  |
| `useInitData`        | `withInitData`        | [InitData](telegram-apps-sdk/components/init-data.md)                              |
| `useInvoice`         | `withInvoice`         | [Invoice](telegram-apps-sdk/components/invoice.md)                                 |
| `useMainButton`      | `withMainButton`      | [MainButton](telegram-apps-sdk/components/main-button.md)                          |
| `useMiniApp`         | `withMiniApp`         | [MiniApp](telegram-apps-sdk/components/mini-app.md)                                |
| `usePopup`           | `withPopup`           | [Popup](telegram-apps-sdk/components/popup.md)                                     |
| `useQRScanner`       | `withQRScanner`       | [QRScanner](telegram-apps-sdk/components/qr-scanner.md)                            |
| `useSettingsButton`  | `withSettingsButton`  | [SettingsButton](telegram-apps-sdk/components/settings-button.md)                  |
| `useThemeParams`     | `withThemeParams`     | [ThemeParams](telegram-apps-sdk/components/theme-params.md)                        |
| `useUtils`           | `withUtils`           | [Utils](telegram-apps-sdk/components/utils.md)                                     |
| `useViewport`        | `withViewport`        | [Viewport](telegram-apps-sdk/components/viewport.md) or `undefined`                |

## Template

We have already created a [template](https://github.com/Telegram-Mini-Apps/solidjs-template) for
Solid JS that utilizes the current package, so you can use it.