# @tma.js/bridge

<p style="display: flex; gap: 8px; min-height: 20px">
  <a href="https://npmjs.com/package/@tma.js/bridge">
    <img src="https://img.shields.io/npm/v/@tma.js/bridge?logo=npm"/>
  </a>
  <a href="https://github.com/Telegram-Mini-Apps/telegram-apps/tree/master/tma.js/bridge">
    <img src="https://img.shields.io/badge/source-black?logo=github"/>
  </a>
</p>

The lowest level communication layer with Telegram Mini Apps.

This package provides fundamental utilities and types for developing applications on the Telegram
Mini Apps platform.

> [!TIP] Higher-level package
> While a developer can use this package alone, it's recommended to use a higher-level package
> like [@tma.js/sdk](./tma-js-sdk.md).

## Installation

::: code-group

```bash [pnpm]
pnpm i @tma.js/bridge
```

```bash [npm]
npm i @tma.js/bridge
```

```bash [yarn]
yarn add @tma.js/bridge
```

:::

## Usage

Here’s a basic example of how to use this package. For more details, refer to the next articles in
the documentation.

```ts
import { on, postEvent, applyPolyfills } from '@tma.js/bridge';

// Apply polyfills for Object.hasOwn. Bridge validators use it.
applyPolyfills();

// Show the back button, wait for it to be clicked once,
// then hide it.
postEvent('web_app_setup_back_button', { is_visible: true });

const off = on('back_button_pressed', () => {
  postEvent('web_app_setup_back_button', { is_visible: false });
  off();
});
```