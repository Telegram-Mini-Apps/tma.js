# @tma.js/sdk-svelte

Svelte bindings for [@tma.js/sdk](../sdk). The package re-exports the SDK, so it is the only
package to install.

```bash
pnpm i @tma.js/sdk-svelte
```

## Components state

Reactive values of SDK components, like `backButton.isVisible` or `mainButton.state`, are
computed values. Use `useComputed` to get a readable store reflecting such a value:

```svelte
<script lang="ts">
  import { backButton, mainButton, useComputed } from '@tma.js/sdk-svelte';

  const isVisible = useComputed(backButton.isVisible);
  const mainButtonState = useComputed(mainButton.state);
</script>

<p>Back button is {$isVisible ? 'visible' : 'hidden'}</p>
<p>Main button text: {$mainButtonState.text}</p>
```

The store is subscribed to the computed value only while it has subscribers, so it can be created
anywhere, not only during a component initialization.
