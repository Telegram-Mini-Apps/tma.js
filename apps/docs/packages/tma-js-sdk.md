# @tma.js/sdk

<p style="display: flex; gap: 8px; min-height: 20px">
  <a href="https://npmjs.com/package/@tma.js/sdk">
    <img src="https://img.shields.io/npm/v/@tma.js/sdk?logo=npm"/>
  </a>
  <a href="https://github.com/Telegram-Mini-Apps/tma.js/tree/master/packages/sdk">
    <img src="https://img.shields.io/badge/source-black?logo=github"/>
  </a>
</p>

Made-from-scratch TypeScript library for seamless communication with Telegram Mini Apps
functionality.

The library simplifies the work with Telegram Mini Apps. It consists of several individual
components and functions, each responsible for a specific aspect of the Telegram Mini Apps
ecosystem: the back button, the main button, the theme, the viewport, popups, storages and others.

Before you begin using the SDK, we highly recommend familiarizing yourself with the Telegram Mini
Apps [documentation](../platform/about.md) to grasp the fundamental concepts of the platform.

::: info Upgrading from 3.x?
See [Migrating from 3.x](./tma-js-sdk/migrate-from-v3.md).
:::

## Installation

::: code-group

```bash [pnpm]
pnpm i @tma.js/sdk
```

```bash [npm]
npm i @tma.js/sdk
```

```bash [yarn]
yarn add @tma.js/sdk
```

:::

### CDN

The package also has a self-contained IIFE build, which can be loaded via a `<script>` tag. It
exposes the package as the `tmajs.sdk` global:

```html
<script src="https://cdn.jsdelivr.net/npm/@tma.js/sdk@4/dist/index.iife.js"></script>
<script>
  tmajs.sdk.init();
  tmajs.sdk.backButton.mount();
</script>
```

Prefer installing the package via a package manager when you use a bundler: the IIFE build
includes all the dependencies and can't be tree-shaken.

::: tip
If you are using React, Vue, Solid or Svelte, install the package specific to your framework
instead. Learn more in the [Usage Tips](./tma-js-sdk/usage-tips.md#installing-the-sdk).
:::

## Prerequisites

The SDK is built on top of [@tma.js/bridge](./tma-js-bridge.md), the lowest level communication
layer with Telegram Mini Apps, and re-exports all of its functionality. So you don't need to
install the bridge separately: functions like `onEvent`, `postEvent`, `request`,
`retrieveLaunchParams` or `mockTelegramEnv` can be imported from `@tma.js/sdk` directly.

The SDK also re-exports init data types (`InitData`, `User`, `Chat`, `ChatType`) and the
`InvalidInitDataError` class from [@tma.js/init-data](./tma-js-init-data.md). To parse,
validate or sign init data, use that package directly.

## Usage Example

```ts
import { init, backButton } from '@tma.js/sdk';

// Initialize the package and configure its global dependencies.
init();

// Mount the back button component and retrieve its actual state.
if (backButton.isSupported()) {
  backButton.mount();
  backButton.show();
}

// When the user clicks the back button, go back in the navigation history.
const off = backButton.onClick(() => {
  off();
  window.history.back();
});
```

## What's Next

- [Initializing](./tma-js-sdk/initializing.md): configuring the SDK before use.
- [Usage Tips](./tma-js-sdk/usage-tips.md): the recommended way of using the SDK.
- [Features](./tma-js-sdk/features.md): how components and functions work, support checks,
  computed values and error handling.
