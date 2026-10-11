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

Solid bindings for [@tma.js/sdk](./tma-js-sdk.md). The package connects reactive values of SDK
components to Solid's reactivity.

::: tip
The package extends [@tma.js/sdk](./tma-js-sdk.md), so it is recommended to review the SDK
documentation first.
:::

::: info Upgrading from 3.x?
See [Migrating from 3.x](./tma-js-sdk-solid/migrate-from-v3.md).
:::

## Installation

The package requires `solid-js` 1.x as a peer dependency.

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

::: info
The package re-exports everything from [@tma.js/sdk](./tma-js-sdk.md), so you don't need to
install the SDK separately. Import both the SDK and `useComputed` from `@tma.js/sdk-solid`.
:::

## Usage

Initialize the SDK and mount the components you use before rendering the application. Then read
the components state using [useComputed](#usecomputed).

:::code-group

```tsx [index.tsx]
import { render } from 'solid-js/web';
import { init, backButton } from '@tma.js/sdk-solid';

import { BackButton } from './BackButton.js';

// Initialize the SDK.
init();

// Mount the Back Button, so it works with its actual state.
backButton.mount();

render(() => <BackButton/>, document.getElementById('root')!);
```

```tsx [BackButton.tsx]
import { createEffect, onCleanup, onMount } from 'solid-js';
import { backButton, useComputed } from '@tma.js/sdk-solid';

/**
 * Component controlling the Back Button visibility.
 */
export function BackButton() {
  const isVisible = useComputed(backButton.isVisible);

  createEffect(() => {
    console.log('The button is', isVisible() ? 'visible' : 'hidden');
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

## `useComputed`

Reactive values of SDK components, like `backButton.isVisible` or `mainButton.state`, are
computed values (the `Computed` type). Calling such a value returns its current state, and its
`subscribe` method tracks changes.

`useComputed` returns a Solid accessor updated whenever the computed value changes.

```tsx
import { backButton, mainButton, useComputed } from '@tma.js/sdk-solid';

function Status() {
  const isVisible = useComputed(backButton.isVisible);
  const mainButtonState = useComputed(mainButton.state);

  return (
    <>
      <p>Back button is {isVisible() ? 'visible' : 'hidden'}</p>
      <p>Main button text: {mainButtonState().text}</p>
    </>
  );
}
```

The hook accepts only computed values provided by the SDK. To store your own reactive state, use
Solid's `createSignal` or `createStore`.

Values are stored as is, so a computed value holding a function returns this function from the
accessor.

### Lifetime

Inside a reactive owner, e.g. a component or `createRoot`, the subscription is removed when the
owner is disposed.

`useComputed` can also be called outside any owner, e.g. in a module scope, to create an accessor
shared by the whole application. In this case, the subscription is never removed, so avoid
calling it this way repeatedly.

```ts
import { mainButton, useComputed } from '@tma.js/sdk-solid';

// Created once and used across the application.
export const isMainButtonVisible = useComputed(mainButton.isVisible);
```
