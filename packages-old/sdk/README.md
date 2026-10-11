# @tma.js/sdk

[code-badge]: https://img.shields.io/badge/source-black?logo=github

[docs-badge]: https://img.shields.io/badge/documentation-blue?logo=gitbook&logoColor=white

[link]: https://github.com/Telegram-Mini-Apps/tma.js/tree/master/tma.js/sdk

[docs-link]: https://docs.telegram-mini-apps.com/packages/tma-js-sdk

[npm-link]: https://npmjs.com/package/@tma.js/sdk

[npm-badge]: https://img.shields.io/npm/v/@tma.js/sdk?logo=npm

[size-badge]: https://img.shields.io/bundlephobia/minzip/@tma.js/sdk

[![NPM][npm-badge]][npm-link]
![Size][size-badge]
[![docs-badge]][docs-link]
[![code-badge]][link]

Made from scratch TypeScript library for seamless communication with Telegram Mini Apps
functionality.

The code of this library is designed to simplify the process of developers interacting with Telegram
Mini Apps. It consists of several individual components, each responsible for a specific aspect of
the Telegram Mini Apps ecosystem.

Before you begin using the SDK, we highly recommend familiarizing yourself with the Telegram Mini
Apps [documentation](https://docs.telegram-mini-apps.com/platform/about)
to grasp the fundamental concepts of the platform.

## Installation

```bash
# pnpm
pnpm i @tma.js/sdk

# yarn
yarn add @tma.js/sdk

# npm
npm i @tma.js/sdk
```

## Usage Example

```typescript
import { init, backButton } from '@tma.js/sdk';

// Initialize all library dependencies.
init();

// Mount all required components used across the application.
// This will lead to components' state restoration.
backButton.mount();
backButton.onClick(() => {
  window.history.back();
});
```

## Documentation

You can find complete documentation over the library [here](https://docs.telegram-mini-apps.com/packages/tma-js-sdk).
