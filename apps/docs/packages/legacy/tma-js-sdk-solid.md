---
outline: [ 2, 3 ]
---

# @tma.js/sdk-solid

<p style="display: inline-flex; gap: 8px">
  <a href="https://npmjs.com/package/@tma.js/sdk-solid">
    <img src="https://img.shields.io/npm/v/@tma.js/sdk-solid?logo=npm"/>
  </a>
  <a href="https://github.com/Telegram-Mini-Apps/tma.js/tree/master/packages/sdk-solid">
    <img src="https://img.shields.io/badge/source-black?logo=github"/>
  </a>
</p>

Solid.js package providing utilities that developers may find useful when developing a mini application.

> [!TIP]
> Since this package offers utility functions that extend the functionality
> of [@tma.js/sdk](./tma-js-sdk.md), it is recommended to review the SDK package
> documentation first.

## Installation

Before proceeding, it is assumed that you have already installed the `solid-js` package, as it is a peer dependency of
this package.

::: code-group

```bash [pnpm]
pnpm i @tma.js/sdk-solid
```

```bash [npm]
npm i @tma.js/sdk-solid
```

```bash [yarn]
yarn add @tma.js/sdk-solid
```

:::

> [!INFO]
> This package fully re-exports the [@tma.js/sdk](./tma-js-sdk) package, so you don't need to install it
> separately.

## Usage

Here is a simple usage example of the package:

:::code-group

```tsx [index.tsx]
import { render } from 'solid-js/web';
import { init, backButton } from '@tma.js/sdk-solid';

import { BackButton } from './BackButton.js';

// Initialize the package.
init();

// Mount the Back Button, so we will work with 
// the actual component properties.
backButton.mount();

render(() => <BackButton />, document.getElementById('root')!);
```

```ts [BackButton.ts]
import { createEffect, onCleanup, onMount } from 'solid-js';
import { backButton, useSignal } from '@tma.js/sdk-solid';

/**
 * Component which controls the Back Button visibility.
 */
export function BackButton() {
  const isVisible = useSignal(backButton.isVisible);

  createEffect(() => {
    console.log('The button is', isVisible() ? 'visible' : 'invisible');
  });

  onMount(() => {
    backButton.show();
    onCleanup(() => {
      backButton.hide();
    });
  });

  return null;
}
```

:::

## Hooks

### `useSignal`

A helper that allows you to use our [signals](./tma-js-signals.md) in the application. It
returns a Solid signal which updates every time, our signal changes.

```ts
import { createEffect, onCleanup, onMount } from 'solid-js';
import { backButton, useSignal } from '@tma.js/sdk-solid';

function Component() {
  const isVisible = useSignal(backButton.isVisible);

  createEffect(() => {
    console.log('The button is', isVisible() ? 'visible' : 'invisible');
  });

  onMount(() => {
    backButton.show();
    onCleanup(() => {
      backButton.hide();
    });
  });

  return null;
}
```
