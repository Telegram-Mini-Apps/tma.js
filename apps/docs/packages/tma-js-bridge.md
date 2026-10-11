# @tma.js/bridge

<p style="display: flex; gap: 8px; min-height: 20px">
  <a href="https://npmjs.com/package/@tma.js/bridge">
    <img src="https://img.shields.io/npm/v/@tma.js/bridge?logo=npm"/>
  </a>
  <a href="https://github.com/Telegram-Mini-Apps/tma.js/tree/master/packages/bridge">
    <img src="https://img.shields.io/badge/source-black?logo=github"/>
  </a>
</p>

The lowest level communication layer between a Telegram Mini App and the Telegram client.

This package provides typed functions to call [Mini Apps methods](../platform/methods.md), listen
to [Mini Apps events](../platform/events.md), retrieve
[launch parameters](../platform/launch-parameters.md) and imitate the Telegram client during
development. It works together with the official SDK
([telegram-web-app.js](https://telegram.org/js/telegram-web-app.js)) loaded on the same page:
neither of them breaks the other one.

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

### CDN

The package also has a self-contained IIFE build, which can be loaded via a `<script>` tag. It
exposes the package as the `tmajs.bridge` global:

```html
<script src="https://cdn.jsdelivr.net/npm/@tma.js/bridge@4/dist/index.iife.js"></script>
<script>
  tmajs.bridge.postEvent('web_app_ready');
</script>
```

Prefer installing the package via a package manager when you use a bundler: the IIFE build
includes all the dependencies and can't be tree-shaken.

## Usage

Here's a basic example of how to use this package. For more details, refer to the next articles in
the documentation.

```ts
import { onEvent, postEvent } from '@tma.js/bridge';

// Show the back button, wait for it to be clicked once,
// then hide it.
postEvent('web_app_setup_back_button', { is_visible: true });

onEvent('back_button_pressed', () => {
  postEvent('web_app_setup_back_button', { is_visible: false });
}, { once: true });
```

## What's Next

- [Methods](./tma-js-bridge/methods.md): calling Mini Apps methods and checking their support.
- [Events](./tma-js-bridge/events.md): listening to Mini Apps events.
- [Launch Parameters](./tma-js-bridge/launch-parameters.md): retrieving launch parameters, init
  data and the start parameter.
- [Environment](./tma-js-bridge/environment.md): detecting Telegram and mocking it during
  development.
- [Globals](./tma-js-bridge/globals.md): debug mode, logger and target origin.
- [Advanced](./tma-js-bridge/advanced.md): calling a method and waiting for an event, invoking
  custom methods.
- [Handling Errors](./tma-js-bridge/errors.md): the `safe` functions and the errors the package
  produces.

Upgrading from the previous major version? Follow the
[migration guide](./tma-js-bridge/migrate-from-v2.md).
