---
outline: [ 2, 3 ]
---

# @tma.js/sdk-react

<p style="display: inline-flex; gap: 8px">
  <a href="https://npmjs.com/package/@tma.js/sdk-react">
    <img src="https://img.shields.io/npm/v/@tma.js/sdk-react?logo=npm"/>
  </a>
  <a href="https://github.com/Telegram-Mini-Apps/tma.js/tree/master/packages/sdk-react">
    <img src="https://img.shields.io/badge/source-black?logo=github"/>
  </a>
</p>

React bindings for [@tma.js/sdk](./tma-js-sdk.md). The package provides hooks connecting SDK
components and launch parameters to React components.

::: tip
The package extends [@tma.js/sdk](./tma-js-sdk.md), so it is recommended to review the SDK
documentation first.
:::

::: info Upgrading from 3.x?
See [Migrating from 3.x](./tma-js-sdk-react/migrate-from-v3.md).
:::

## Installation

The package requires `react` 18 or 19 as a peer dependency.

::: code-group

```bash [pnpm]
pnpm i @tma.js/sdk-react
```

```bash [npm]
npm i @tma.js/sdk-react
```

```bash [yarn]
yarn add @tma.js/sdk-react
```

:::

::: info
The package re-exports everything from [@tma.js/sdk](./tma-js-sdk.md), so you don't need to
install the SDK separately. Import both the SDK and the hooks from `@tma.js/sdk-react`.
:::

## Usage

Initialize the SDK and mount the components you use before rendering the application. Then read
the components state in React components using [useComputed](#usecomputed).

:::code-group

```tsx [index.tsx]
import ReactDOM from 'react-dom/client';
import { init, backButton } from '@tma.js/sdk-react';

import { BackButton } from './BackButton.js';

// Initialize the SDK.
init();

// Mount the Back Button, so it works with its actual state.
backButton.mount();

ReactDOM
  .createRoot(document.getElementById('root')!)
  .render(<BackButton/>);
```

```tsx [BackButton.tsx]
import { useEffect } from 'react';
import { backButton, useComputed } from '@tma.js/sdk-react';

/**
 * Component controlling the Back Button visibility.
 */
export function BackButton() {
  const isVisible = useComputed(backButton.isVisible);

  useEffect(() => {
    console.log('The button is', isVisible ? 'visible' : 'hidden');
  }, [isVisible]);

  useEffect(() => {
    backButton.show();
    return () => {
      backButton.hide();
    };
  }, []);

  return null;
}
```

:::

## Hooks

### `useComputed`

Reactive values of SDK components, like `backButton.isVisible` or `mainButton.state`, are
computed values (the `Computed` type). Calling such a value returns its current state, and its
`subscribe` method tracks changes.

`useComputed` returns the current value and re-renders the component whenever it changes.

```tsx
import { backButton, mainButton, useComputed } from '@tma.js/sdk-react';

function BackButtonStatus() {
  const isVisible = useComputed(backButton.isVisible);
  return <p>Back button is {isVisible ? 'visible' : 'hidden'}</p>;
}

function MainButtonText() {
  const { text } = useComputed(mainButton.state);
  return <p>Main button text: {text}</p>;
}
```

The hook accepts only computed values provided by the SDK. To store your own reactive state, use
React state or any state management library.

The hook is based on React's `useSyncExternalStore`. The optional second argument is a function
returning the value used during server rendering and hydration. By default, the computed value
itself is used.

```tsx
const isVisible = useComputed(backButton.isVisible, () => false);
```

### `useLaunchParams`

Returns the application [launch parameters](../platform/launch-parameters.md). It works the same
way as the `retrieveLaunchParams` function from
[@tma.js/bridge](./tma-js-bridge/launch-parameters.md), and throws `LaunchParamsRetrieveError` if
launch parameters are not found.

The value is computed once, on the first render of the component.

```tsx
import { useLaunchParams } from '@tma.js/sdk-react';

function Component() {
  console.log(useLaunchParams());
  // {
  //   tgWebAppBotInline: false,
  //   tgWebAppData: 'user=%7B%22id%22%3A...&auth_date=...&hash=...',
  //   tgWebAppPlatform: 'tdesktop',
  //   tgWebAppThemeParams: { bg_color: '#17212b', ... },
  //   tgWebAppVersion: '8.0',
  //   ...
  // }
}
```

::: tip
`tgWebAppData` is init data in the raw format. Pass it to your server to authorize the user. To
work with parsed init data, use the SDK [initData](./tma-js-sdk/features/init-data.md) component.
:::

### `useRawLaunchParams`

Returns launch parameters in the raw format from any known source. The value is computed once,
on the first render of the component.

```tsx
import { useRawLaunchParams } from '@tma.js/sdk-react';

function Component() {
  console.log(useRawLaunchParams());
  // 'tgWebAppBotInline=0&tgWebAppData=user%3D...&tgWebAppPlatform=tdesktop&...'
}
```

### `useRawInitData`

Returns init data in the raw format, or `undefined` if launch parameters contain no init data. The
value is computed once, on the first render of the component.

```tsx
import { useRawInitData } from '@tma.js/sdk-react';

function Component() {
  console.log(useRawInitData());
  // 'user=%7B%22id%22%3A...&auth_date=...&hash=...'
}
```

### `useAndroidDeviceData`

Returns [Android device data](https://core.telegram.org/bots/webapps#additional-data-in-user-agent)
from `navigator.userAgent`. All properties of the returned object are optional, and the object is
empty outside Telegram for Android.

```tsx
import { useAndroidDeviceData } from '@tma.js/sdk-react';

function Component() {
  const deviceData = useAndroidDeviceData();
  // Example complete output:
  // {
  //   appVersion: '11.11.0',
  //   manufacturer: 'Samsung',
  //   model: 'SM-A155F',
  //   androidVersion: '14',
  //   sdkVersion: 34,
  //   performanceClass: 'AVERAGE',
  // }
}
```

### `useAndroidDeviceDataFrom`

Works the same way as [useAndroidDeviceData](#useandroiddevicedata), but parses the passed user
agent. The value is recomputed when the user agent changes.

```tsx
import { useAndroidDeviceDataFrom } from '@tma.js/sdk-react';

function Component({ userAgent }: { userAgent: string }) {
  const deviceData = useAndroidDeviceDataFrom(userAgent);
}
```
