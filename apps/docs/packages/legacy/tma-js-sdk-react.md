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

React.js package providing utilities that developers may find useful when developing a mini application.

> [!TIP]
> Since this package offers utility functions that extend the functionality of [@tma.js/sdk](./tma-js-sdk.md), it is
> recommended to review the SDK package documentation first.

## Installation

Before proceeding, it is assumed that you have already installed the `react` package, as it is a peer dependency of this
package.

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

> [!INFO]
> This package fully re-exports the [@tma.js/sdk](./tma-js-sdk.md) package, so you don't need to install it separately.

## Usage

Here is a simple usage example of the package:

:::code-group

```tsx [index.tsx]
import ReactDOM from 'react-dom/client';
import { init, backButton } from '@tma.js/sdk-react';

import { BackButton } from './BackButton.js';

// Initialize the package.
init();

// Mount the Back Button, so we will work with 
// the actual component properties.
backButton.mount();

ReactDOM
  .createRoot(document.getElementById('root')!)
  .render(<BackButton />);
```

```ts [BackButton.ts]
import { useEffect } from 'react';
import { backButton, useSignal } from '@tma.js/sdk-react';

/**
 * Component which controls the Back Button visibility.
 */
export function BackButton() {
  const isVisible = useSignal(backButton.isVisible);

  useEffect(() => {
    console.log('The button is', isVisible ? 'visible' : 'invisible');
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

### `useLaunchParams`

A hook that retrieves the application launch parameters. It works exactly as the `retrieveLaunchParams` function
described in the `@tma.js/bridge`
's [documentation](./tma-js-bridge/launch-parameters#retrieving-launch-parameters).

```ts
import { useLaunchParams } from '@tma.js/sdk-react';

function Component() {
  console.log(useLaunchParams());
  // {
  //   tgWebAppBotInline: false,
  //   tgWebAppData: {
  //     user: { ... },
  //     auth_date: Date(...),
  //     query_id: ...,
  //     hash: ...
  //   },
  //   ...
  // };
}

function Component2() {
  console.log(useLaunchParams(true));
  // {
  //   tgWebAppBotInline: false,
  //   tgWebAppData: {
  //     user: { ... },
  //     authDate: Date(...),
  //     queryId: ...
  //     hash: ...
  //   },
  //   ...
  // };
}
```

### `useRawLaunchParams`

Returns launch parameters in a raw format from any known source.

```ts
import { useRawLaunchParams } from '@tma.js/sdk-react';

function Component() {
  console.log(useRawLaunchParams());
  // tgWebAppBotInline=0&tgWebAppData=%7B%22user%22%3A%7B%7D...
}
```

### `useRawInitData`

Uses the [retrieveRawInitData](./tma-js-bridge/launch-parameters#retrieving-raw-init-data)function under the hood and
allows retrieving the init data passed in its initial format.

```ts
import { useRawInitData } from '@tma.js/sdk-react';

function Component() {
  console.log(useRawInitData());
  // '{"user":...,"auth_date":...,"query_id":...,...}'
}
```

### `useSignal`

A helper that allows a developer to use our [signals](./tma-js-signals.md) in the application.

It returns the underlying value and updates it whenever the signal value changes.

```ts
import { useEffect } from 'react';
import { backButton, useSignal } from '@tma.js/sdk-react';

function Component() {
  const isVisible = useSignal(backButton.isVisible);

  useEffect(() => {
    console.log('The button is', isVisible ? 'visible' : 'invisible');
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

### `useAndroidDeviceData`

Retrieves [Android device data](https://core.telegram.org/bots/webapps#additional-data-in-user-agent) from the
`navigator.userAgent`.

The function always returns an object describing the Android device data with all keys marked as optional.

```ts
import { useAndroidDeviceData } from '@tma.js/sdk-react';

function Component() {
  const deviceData = useAndroidDeviceData();
  // Example complete output:
  // {
  //   manufacturer: 'Samsung',
  //   performanceClass: 'AVERAGE',
  //   model: 'SM-A155F',
  //   androidVersion: '14',
  //   sdkVersion: 34,
  // }
}
```

### `useAndroidDeviceDataFrom`

This function works the same as [useAndroidDeviceData](#useandroiddevicedata), but allows passing a custom value to
parse.

```ts
import { useAndroidDeviceDataFrom } from '@tma.js/sdk-react';

function Component() {
  const deviceData = useAndroidDeviceDataFrom(navigator.userAgent);
  // Example complete output:
  // {
  //   manufacturer: 'Samsung',
  //   performanceClass: 'AVERAGE',
  //   model: 'SM-A155F',
  //   androidVersion: '14',
  //   sdkVersion: 34,
  // }
}
```
