# @telegram-apps/solid-router-integration

<p style="display: inline-flex; gap: 8px">
  <a href="https://npmjs.com/package/@telegram-apps/solid-router-integration">
    <img src="https://img.shields.io/npm/v/@telegram-apps/solid-router-integration?logo=npm"/>
  </a>
  <img src="https://img.shields.io/bundlephobia/minzip/@telegram-apps/solid-router-integration"/>
  <a href="https://github.com/Telegram-Mini-Apps/telegram-apps/tree/master/packages/solid-router-integration">
    <img src="https://img.shields.io/badge/source-black?logo=github"/>
  </a>
</p>

Telegram Mini Apps [Navigator](telegram-apps-sdk/navigation.md) integration
for [@solidjs/router](https://www.npmjs.com/package/@solidjs/router).

## Installation

::: code-group

```bash [pnpm]
pnpm i @telegram-apps/solid-router-integration
```

```bash [npm]
npm i @telegram-apps/solid-router-integration
```

```bash [yarn]
yarn add @telegram-apps/solid-router-integration
```

:::

## Usage

At the moment, this package provides the only 1 function, which creates the integration for
`@solidjs/router` Router - `createRouter`.

Here is how it could be used:

```jsx
import { Routes, Route, Navigate } from '@solidjs/router';
import { onCleanup } from 'solid-js';
import { initNavigator } from '@telegram-apps/sdk-solid';
import { createRouter } from '@telegram-apps/solid-router-integration';

import { IndexPage } from './IndexPage.js';

function App() {
  // We should create navigator to pass it to integration creation.
  const navigator = initNavigator('app-navigator-state');

  // Then, to allow this navigator update current browser history, 
  // we should attach it. Otherwise, it will work in memory mode.
  void navigator.attach();
  onCleanup(() => {
    navigator.detach();
  });

  const Router = createRouter(navigator);

  return (
    <Router>
      <Routes>
        <Route path={'/'} component={IndexPage}/>
        <Route path={'*'} element={<Navigate href={'/'}/>}/>
      </Routes>
    </Router>
  );
}
```

You can learn more about how to use it real world applications using
our [Solid template](https://github.com/Telegram-Mini-Apps/solidjs-template).

