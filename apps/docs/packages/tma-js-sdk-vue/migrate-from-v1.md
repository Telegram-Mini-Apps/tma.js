# Migrating from 1.x

This guide describes how to upgrade `@tma.js/sdk-vue` from 1.x to the current major version.

The package re-exports [@tma.js/sdk](../tma-js-sdk.md), so all changes of the SDK apply to it too.
Read the [SDK migration guide](../tma-js-sdk/migrate-from-v3.md) first, as most of the work is
there. For an overview of all packages, see [Upgrading Packages](../upgrading.md).

## Peer Dependencies

`@tma.js/sdk` is now a peer dependency instead of a regular one, so install it alongside the
package:

```bash
pnpm i @tma.js/sdk @tma.js/sdk-vue
```

This guarantees a single copy of the SDK in the application. The SDK components are singletons
with their own state, and a second copy would make the bindings track a state the application
never changes.

The package requires Vue 3.2 or newer, as it uses effect scopes.

| Package | 1.x      | Current major version |
|---------|----------|-----------------------|
| `vue`   | `^3.0.0` | `^3.2.0`              |

## `useSignal` Replaced With `useComputed`

The `useSignal` hook was removed. Use `useComputed` instead. Like before, it returns a readonly
ref updated whenever the value changes.

Before:

```vue
<script setup lang="ts">
import { backButton, useSignal } from '@tma.js/sdk-vue';

const isVisible = useSignal(backButton.isVisible);
</script>

<template>
  <p>Back button is {{ isVisible ? 'visible' : 'hidden' }}</p>
</template>
```

After:

```vue
<script setup lang="ts">
import { backButton, useComputed } from '@tma.js/sdk-vue';

const isVisible = useComputed(backButton.isVisible);
</script>

<template>
  <p>Back button is {{ isVisible ? 'visible' : 'hidden' }}</p>
</template>
```

### Only SDK Computed Values Are Accepted

`useSignal` accepted any signal-like object with the `sub` method, including signals created with
`@tma.js/signals`. `useComputed` accepts only computed values (the `Computed` type) provided by the
SDK, e.g. `backButton.isVisible` or `mainButton.state`.

The `@tma.js/signals` package was removed, and the SDK doesn't export functions creating signals.
Keep your own state in Vue's `ref` or `reactive`. See
[@tma.js/signals](../upgrading.md#tma-js-signals) for details.

### `isSupported` Is a Function

`isSupported` of SDK components was a signal, so it could be passed to `useSignal`. Now it is a
plain function, as support doesn't change during the application lifetime. Call it directly:

```ts
// Before.
const isSupported = useSignal(backButton.isSupported);

// After.
const isSupported = backButton.isSupported();
```

The `isAvailable` signals were removed. See the
[SDK migration guide](../tma-js-sdk/migrate-from-v3.md) for their replacements.

## The Ref Is Shallow

`useSignal` stored values in `ref`, which deeply converts objects into reactive proxies.
`useComputed` stores values in `shallowRef`, so objects returned by the SDK, e.g.
`mainButton.state` or `initData.user`, are stored as is and keep their identity.

::: warning
This change is silent:

- Objects read from the ref are no longer reactive proxies. `isProxy(state.value)` and
  `isReactive(state.value)` now return `false`, and `state.value === mainButton.state()` now
  returns `true`.
- Nested properties are not tracked separately. Every change of the computed value replaces the
  whole ref value, so watchers and computed properties reading nested properties are still
  triggered.
- Objects read from the ref are frozen, so mutating them throws `TypeError` instead of changing
  the object.
:::

The ref is still readonly. To change the state, call the component methods, e.g.
`mainButton.setText('Submit')`.

## Usage Outside Components

`useSignal` removed the subscription in `onBeforeUnmount`, so it could be called only in a
component setup. Outside a component, Vue warned about the hook called without an active
component instance.

`useComputed` removes the subscription when the current effect scope is disposed. It works in a
component setup, in composables called from it, in Pinia setup stores and in scopes created with
`effectScope`.

```ts
import { effectScope } from 'vue';
import { mainButton, useComputed } from '@tma.js/sdk-vue';

const scope = effectScope();
const isVisible = scope.run(() => useComputed(mainButton.isVisible))!;

// Removes the subscription.
scope.stop();
```

::: warning
The subscription is now removed when the scope is disposed, not before the component unmounts. If
the scope is not disposed, e.g. `useComputed` is called outside any effect scope, the subscription
is never removed. Avoid calling it repeatedly this way.
:::
