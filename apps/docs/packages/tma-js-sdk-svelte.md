---
outline: [ 2, 3 ]
---

# @tma.js/sdk-svelte

<p style="display: inline-flex; gap: 8px">
  <a href="https://npmjs.com/package/@tma.js/sdk-svelte">
    <img src="https://img.shields.io/npm/v/@tma.js/sdk-svelte?logo=npm"/>
  </a>
  <a href="https://github.com/Telegram-Mini-Apps/tma.js/tree/master/packages/sdk-svelte">
    <img src="https://img.shields.io/badge/source-black?logo=github"/>
  </a>
</p>

Svelte bindings for [@tma.js/sdk](./tma-js-sdk.md). The package turns reactive values of SDK
components into Svelte stores.

::: tip
The package extends [@tma.js/sdk](./tma-js-sdk.md), so it is recommended to review the SDK
documentation first.
:::

::: info Upgrading from 1.x?
See [Migrating from 1.x](./tma-js-sdk-svelte/migrate-from-v1.md).
:::

## Installation

The package requires [@tma.js/sdk](./tma-js-sdk.md) and `svelte` 3, 4 or 5 as peer dependencies.

::: code-group

```bash [pnpm]
pnpm i @tma.js/sdk @tma.js/sdk-svelte
```

```bash [npm]
npm i @tma.js/sdk @tma.js/sdk-svelte
```

```bash [yarn]
yarn add @tma.js/sdk @tma.js/sdk-svelte
```

:::

::: info
The package re-exports everything from [@tma.js/sdk](./tma-js-sdk.md), so you can import both
the SDK and `useComputed` from `@tma.js/sdk-svelte`. The SDK is a peer dependency, so the
application always has a single copy of it: its components are singletons with their own state.
:::

## Usage

Initialize the SDK and mount the components you use before mounting the application. Then read
the components state using [useComputed](#usecomputed).

:::code-group

```ts [main.ts]
import { mount } from 'svelte';
import { init, backButton } from '@tma.js/sdk-svelte';

import App from './App.svelte';

// Initialize the SDK.
init();

// Mount the Back Button, so it works with its actual state.
backButton.mount();

mount(App, { target: document.getElementById('app')! });
```

```svelte [App.svelte]
<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { backButton, useComputed } from '@tma.js/sdk-svelte';

  const isVisible = useComputed(backButton.isVisible);

  $: console.log('The button is', $isVisible ? 'visible' : 'hidden');

  onMount(() => {
    backButton.show();
  });

  onDestroy(() => {
    backButton.hide();
  });
</script>

<p>Back button is {$isVisible ? 'visible' : 'hidden'}</p>
```

:::

::: tip
`mount` from `svelte` is Svelte 5 API. In Svelte 3 and 4, create the application using
`new App({ target })`.
:::

## `useComputed`

Reactive values of SDK components, like `backButton.isVisible` or `mainButton.state`, are
computed values (the `Computed` type). Calling such a value returns its current state, and its
`subscribe` method tracks changes.

`useComputed` returns a readable Svelte store reflecting the computed value. Use it with the `$`
prefix in components, or subscribe to it manually.

```svelte
<script lang="ts">
  import { backButton, mainButton, useComputed } from '@tma.js/sdk-svelte';

  const isVisible = useComputed(backButton.isVisible);
  const mainButtonState = useComputed(mainButton.state);
</script>

<p>Back button is {$isVisible ? 'visible' : 'hidden'}</p>
<p>Main button text: {$mainButtonState.text}</p>
```

The hook accepts only computed values provided by the SDK. To store your own reactive state, use
Svelte's `writable` store or runes.

The store is read-only. To change the state, call the component methods, e.g. `backButton.show()`.

### Lifetime

The store is subscribed to the computed value only while the store itself has subscribers, and
reads the current value when the first subscriber is added. So the store can be created anywhere,
not only during a component initialization, for example in a separate module:

```ts
import { mainButton, useComputed } from '@tma.js/sdk-svelte';

export const isMainButtonVisible = useComputed(mainButton.isVisible);
```
