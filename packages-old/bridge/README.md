# @tma.js/bridge

[code-badge]: https://img.shields.io/badge/source-black?logo=github

[docs-badge]: https://img.shields.io/badge/documentation-blue?logo=gitbook&logoColor=white

[link]: https://github.com/Telegram-Mini-Apps/tma.js/tree/master/tma.js/bridge

[docs-link]: https://docs.telegram-mini-apps.com/packages/tma-js-bridge

[npm-link]: https://npmjs.com/package/@tma.js/bridge

[npm-badge]: https://img.shields.io/npm/v/@tma.js/bridge?logo=npm

[size-badge]: https://img.shields.io/bundlephobia/minzip/@tma.js/bridge

[![NPM][npm-badge]][npm-link]
![Size][size-badge]
[![docs-badge]][docs-link]
[![code-badge]][link]

The lowest level communication layer with Telegram Mini Apps.

This package provides fundamental utilities and types for developing applications on the Telegram
Mini Apps platform.

While a developer can use this package alone, it's recommended to use a higher-level package
like [@tma.js/sdk](https://docs.telegram-mini-apps.com/packages/tma-js-sdk).

## Installation

```bash
pnpm i @tma.js/bridge
# or
npm i @tma.js/bridge
# or
yarn add @tma.js/bridge
```

## Usage

Here’s a basic example of how to use this package. For more details, refer to the package complete
[documentation](https://docs.telegram-mini-apps.com/packages/tma-js-bridge).

```ts
import { on, postEvent, applyPolyfills } from '@tma.js/bridge';

// The package uses some polyfills, so let's use them.
applyPolyfills();

// Show the back button, wait for it to be clicked once,
// then hide it.
postEvent('web_app_setup_back_button', { is_visible: true });

const off = on('back_button_pressed', () => {
  postEvent('web_app_setup_back_button', { is_visible: false });
  off();
});
```
