# @tma.js/sdk-vue

Vue bindings for [@tma.js/sdk](../sdk). The package re-exports the SDK, so it is the only
package to install.

```bash
pnpm i @tma.js/sdk-vue
```

## Components state

Reactive values of SDK components, like `backButton.isVisible` or `mainButton.state`, are
computed values. Use `useComputed` to get a readonly ref updated whenever such a value changes:

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

Inside an effect scope, e.g. a component setup, the subscription is removed when the scope is
disposed.
