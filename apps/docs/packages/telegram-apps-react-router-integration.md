# @telegram-apps/react-router-integration

<p style="display: inline-flex; gap: 8px">
  <a href="https://npmjs.com/package/@telegram-apps/react-router-integration">
    <img src="https://img.shields.io/npm/v/@telegram-apps/react-router-integration?logo=npm"/>
  </a>
  <img src="https://img.shields.io/bundlephobia/minzip/@telegram-apps/react-router-integration"/>
  <a href="https://github.com/Telegram-Mini-Apps/telegram-apps/tree/master/packages/react-router-integration">
    <img src="https://img.shields.io/badge/source-black?logo=github"/>
  </a>
</p>

Telegram Mini Apps [Navigator](telegram-apps-sdk/navigation.md) integration
for [react-router-dom](https://www.npmjs.com/package/react-router-dom).

## Installation

::: code-group

```bash [pnpm]
pnpm i @telegram-apps/react-router-integration
```

```bash [npm]
npm i @telegram-apps/react-router-integration
```

```bash [yarn]
yarn add @telegram-apps/react-router-integration
```

:::

## Usage

At the moment, this package provides the only 1 function, which creates the integration for
`react-router-dom` Router - `useIntegration`.

Here is how it could be used:

```jsx
import { useIntegration } from '@telegram-apps/react-router-integration';
import { initNavigator } from '@telegram-apps/sdk-react';
import { useEffect, useMemo } from 'react';
import {
  Navigate,
  Route,
  Router,
  Routes,
} from 'react-router-dom';

import { IndexPage } from './IndexPage.js';

function App() {
  // Create a new application navigator and attach it to the browser history, so it could modify
  // it and listen to its changes.
  const navigator = useMemo(() => initNavigator('app-navigation-state'), []);
  const [location, reactNavigator] = useIntegration(navigator);

  // Don't forget to attach the navigator to allow it to control the BackButton state as well
  // as browser history.
  useEffect(() => {
    navigator.attach();
    return () => navigator.detach();
  }, [navigator]);

  return (
    <Router location={location} navigator={reactNavigator}>
      <Routes>
        <Route path={'/'} component={IndexPage}/>
        <Route path={'*'} element={<Navigate href={'/'}/>}/>
      </Routes>
    </Router>
  );
}
```

You can learn more about how to use it real world applications using
our [React template](https://github.com/Telegram-Mini-Apps/reactjs-template).

