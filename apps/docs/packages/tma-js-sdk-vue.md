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

Vue bindings for [@tma.js/sdk](./tma-js-sdk.md). The package turns reactive values of SDK
components into Vue refs.

::: tip
The package extends [@tma.js/sdk](./tma-js-sdk.md), so it is recommended to review the SDK
documentation first.
:::

::: info Upgrading from 1.x?
See [Migrating from 1.x](./tma-js-sdk-vue/migrate-from-v1.md).
:::

## Installation

The package requires `vue` 3.2 or newer as a peer dependency.

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

::: info
The package re-exports everything from [@tma.js/sdk](./tma-js-sdk.md), so you don't need to
install the SDK separately. Import both the SDK and `useComputed` from `@tma.js/sdk-vue`.
:::

## Usage

Initialize the SDK and mount the components you use before mounting the application. Then read
the components state using [useComputed](#usecomputed).

:::code-group

```ts [main.ts]
import { createApp } from 'vue';
import { init, backButton } from '@tma.js/sdk-vue';

import App from './App.vue';

// Initialize the SDK.
init();

// Mount the Back Button, so it works with its actual state.
backButton.mount();

createApp(App).mount('#app');
```

```vue [App.vue]
<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { backButton, useComputed } from '@tma.js/sdk-vue';

const isVisible = useComputed(backButton.isVisible);

watch(isVisible, value => {
  console.log('The button is', value ? 'visible' : 'hidden');
});

onMounted(() => {
  backButton.show();
});

onUnmounted(() => {
  backButton.hide();
});
</script>

<template>
  <p>Back button is {{ isVisible ? 'visible' : 'hidden' }}</p>
</template>
```

:::

## `useComputed`

Reactive values of SDK components, like `backButton.isVisible` or `mainButton.state`, are
computed values (the `Computed` type). Calling such a value returns its current state, and its
`subscribe` method tracks changes.

`useComputed` returns a readonly ref updated whenever the computed value changes.

```vue
<script setup lang="ts">
import { backButton, mainButton, useComputed } from '@tma.js/sdk-vue';

const isVisible = useComputed(backButton.isVisible);
const mainButtonState = useComputed(mainButton.state);
</script>

<template>
  <p>Back button is {{ isVisible ? 'visible' : 'hidden' }}</p>
  <p>Main button text: {{ mainButtonState.text }}</p>
</template>
```

The hook accepts only computed values provided by the SDK. To store your own reactive state, use
Vue's `ref` or `reactive`.

The ref is shallow: objects returned by the SDK are not wrapped into reactive proxies, so they keep
their identity. Every change of the computed value replaces the ref value, so watchers of the ref
are triggered without the `deep` option. To change the state, call the component methods, e.g.
`backButton.show()`.

### Lifetime

Inside an effect scope, e.g. a component setup, a composable called from it, or a scope created
with `effectScope`, the subscription is removed when the scope is disposed.

`useComputed` can also be called outside any effect scope, e.g. in a module scope, to create a ref
shared by the whole application. In this case, the subscription is never removed, so avoid calling
it this way repeatedly.

```ts [useMainButton.ts]
import { mainButton, useComputed } from '@tma.js/sdk-vue';

/**
 * Composable encapsulating the Main Button logic.
 */
export function useMainButton() {
  if (!mainButton.isMounted()) {
    mainButton.mount();
  }
  return {
    isVisible: useComputed(mainButton.isVisible),
    text: useComputed(mainButton.text),
  };
}
```

## Vue Router Integration

Telegram passes launch parameters to the mini app in the URL hash, see
[this article](../platform/launch-parameters.md#transmission-method) for more details.

Therefore, [Vue Router](https://router.vuejs.org/) should use the
[HTML5 mode](https://router.vuejs.org/guide/essentials/history-mode.html#HTML5-Mode):

```ts [router.ts]
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ...
  ],
});
```
