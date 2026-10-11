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

Svelte.js package providing utilities that developers may find useful when developing a mini application.

> [!TIP]
> Since this package offers utility functions that extend the functionality of [@tma.js/sdk](./tma-js-sdk.md), it is
> recommended to review the SDK package documentation first.

## Installation

Before proceeding, it is assumed that you have already installed the `svelte-js` package, as it is a
peer dependency of this package.

::: code-group

```bash [pnpm]
pnpm i @tma.js/sdk-svelte
```

```bash [npm]
npm i @tma.js/sdk-svelte
```

```bash [yarn]
yarn add @tma.js/sdk-svelte
```

:::

> [!INFO]
> This package fully re-exports the [@tma.js/sdk](./tma-js-sdk.md) package, so you don't need to install it separately.

## Usage

Here is a simple usage example of the package:

:::code-group

```svelte [index.svelte]
<script lang="ts">
  import { init, backButton } from '@tma.js/sdk-svelte';

  import { BackButton } from './BackButton.svelte';

  // Initialize the package.
  init();
</script>

<BackButton />
```

```svelte [BackButton.svelte]
/**
 * Component which controls the Back Button visibility.
 */
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { backButton, useSignal } from '@tma.js/sdk-svelte';

  const isVisible = useSignal(backButton.isVisible);

  $: console.log('The button is', isVisible.value ? 'visible' : 'invisible')

  onMount(() => {
    backButton.show();
  });

  onDestroy(() => {
    backButton.hide();
  });
</script>
```

:::

## Hooks

### `useSignal`

A helper that allows you to use our [signals](./tma-js-signals.md) in the application. It returns a Svelte ref which
updates every time, our signal changes.

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { backButton, useSignal } from '@tma.js/sdk-svelte';

  const isVisible = useSignal(backButton.isVisible);

  $: console.log('The button is', isVisible.value ? 'visible' : 'invisible')

  onMount(() => {
    backButton.show();
  });

  onDestroy(() => {
    backButton.hide();
  });
</script>
```
