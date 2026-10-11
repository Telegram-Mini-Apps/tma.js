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

The code of this library is designed to simplify the process for developers interacting with
Telegram Mini Apps. It consists of several individual components, each responsible for a specific
aspect of the Telegram Mini Apps ecosystem.

Before you begin using the SDK, we highly recommend familiarizing yourself with the Telegram Mini
Apps [documentation](../../platform/about.md) to grasp the fundamental concepts of the platform.

As well as the `@tma.js/bridge` package, the SDK provides a lot of utilities free to be used in a functional
way. You can learn more about it this approach [here](./tma-js-bridge/functional-approach.md).

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

## Prerequisites

Before diving deep into the documentation of this package, it is recommended to familiarize
yourself with the following packages:

- [@tma.js/signals](./tma-js-signals.md) - our own JavaScript signals used almost
  everywhere in the package.
- [@tma.js/bridge](./tma-js-bridge.md) - the lowest level communication layer with
  Telegram Mini Apps. The SDK uses it under the hood and re-exports some functionality.

## Usage Example

```ts
import { init, backButton } from '@tma.js/sdk';

// Init the package and actualize all global dependencies.
init();

// Mount the back button component and retrieve its actual
// state.
backButton.mount();

// When a user clicked the back button, go back in the
// navigation history.
const off = backButton.onClick(() => {
  off();
  window.history.back();
});
```