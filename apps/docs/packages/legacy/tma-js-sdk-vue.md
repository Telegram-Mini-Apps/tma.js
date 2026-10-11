---
outline: [ 2, 3 ]
---

# @tma.js/sdk-vue

<p style="display: inline-flex; gap: 8px">
  <a href="https://npmjs.com/package/@tma.js/sdk-vue">
    <img src="https://img.shields.io/npm/v/@tma.js/sdk-vue?logo=npm"/>
  </a>
  <a href="https://github.com/Telegram-Mini-Apps/tma.js/tree/master/packages/sdk-vue">
    <img src="https://img.shields.io/badge/source-black?logo=github"/>
  </a>
</p>

Vue.js package providing utilities that developers may find useful when developing a mini application.

> [!TIP]
> Since this package offers utility functions that extend the functionality of [@tma.js/sdk](./tma-js-sdk.md), it is
> recommended to review the SDK package documentation first.

## Installation

Before proceeding, it is assumed that you have already installed the `vue` package, as it is a peer dependency of this
package.

::: code-group

```bash [pnpm]
pnpm i @tma.js/sdk-vue
```

```bash [npm]
npm i @tma.js/sdk-vue
```

```bash [yarn]
yarn add @tma.js/sdk-vue
```

:::

> [!INFO]
> This package fully re-exports the [@tma.js/sdk](./tma-js-sdk.md) package, so you don't need to install it separately.

## Usage

Here is a simple usage example of the package:

:::code-group

```ts [index.ts]
import { createApp } from 'vue';
import { init } from '@tma.js/sdk-vue';
import App from './App.vue';

// Initialize the package.
init();

const app = createApp(App);

app.mount('#root');
```

```vue [PopupButton.vue]

<script setup lang="ts">
  /**
   * Component which opens native Telegram Popup.
   */
  import { popup } from '@tma.js/sdk-vue'

  const props = defineProps<{ title: string, message: string }>()

  function open() {
    if (popup.isSupported()) {
      popup.open(props);
      return;
    }

    // Open fallback HTML dialog...
  }
</script>

<template>
  <button aria-haspopup="dialog" @click="open">
    Open popup
  </button>
</template>
```

:::

## Hooks

### `useSignal`

A helper that allows you to use our [signals](./tma-js-signals.md) in the application. It
returns a Vue ref which updates every time, our signal changes.

```ts [useMainButton.vue]
/**
 * Composable which encapsulates mainButton interaction logic
 */
import { mainButton, useSignal } from '@tma.js/sdk-vue';

export function useMainButton() {
  if (!mainButton.isMounted()) {
    mainButton.mount();
  }

  const isVisible = useSignal(mainButton.isVisible);

  return { isVisible };
}
```

## Vue Router integration

Telegram application uses URL's hash to transmit launch parameters into TMA,
see [that article](../../platform/launch-parameters#transmission-method) for more details.

Therefore, [Vue router](https://router.vuejs.org/) should
use [HTML5 mode](https://router.vuejs.org/guide/essentials/history-mode.html#HTML5-Mode):

```ts [router.ts]
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    //...
  ],
})
```
