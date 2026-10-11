# Migrating from 1.x

This guide describes how to upgrade `@tma.js/sdk-svelte` from 1.x to the current major version.

The package re-exports [@tma.js/sdk](../tma-js-sdk.md), so all changes of the SDK apply to it too.
Read the [SDK migration guide](../tma-js-sdk/migrate-from-v3.md) first, as most of the work is
there. For an overview of all packages, see [Upgrading Packages](../upgrading.md).

## Peer Dependencies

`@tma.js/sdk` is now a peer dependency instead of a regular one, so install it alongside the
package:

```bash
pnpm i @tma.js/sdk @tma.js/sdk-svelte
```

This guarantees a single copy of the SDK in the application. The SDK components are singletons
with their own state, and a second copy would make the bindings track a state the application
never changes.

The supported Svelte versions were widened. Svelte 3 and 4 are supported again.

| Package  | 1.x      | Current major version     |
|----------|----------|---------------------------|
| `svelte` | `^5.2.3` | `^3 \|\| ^4 \|\| ^5`      |

## `useSignal` Replaced With `useComputed`

The `useSignal` hook was removed. Use `useComputed` instead. Like before, it returns a Svelte store,
so use it with the `$` prefix in components.

Before:

```svelte
<script lang="ts">
  import { backButton, useSignal } from '@tma.js/sdk-svelte';

  const isVisible = useSignal(backButton.isVisible);
</script>

<p>Back button is {$isVisible ? 'visible' : 'hidden'}</p>
```

After:

```svelte
<script lang="ts">
  import { backButton, useComputed } from '@tma.js/sdk-svelte';

  const isVisible = useComputed(backButton.isVisible);
</script>

<p>Back button is {$isVisible ? 'visible' : 'hidden'}</p>
```

### Only SDK Computed Values Are Accepted

`useSignal` accepted any signal-like object with the `sub` method, including signals created with
`@tma.js/signals`. `useComputed` accepts only computed values (the `Computed` type) provided by the
SDK, e.g. `backButton.isVisible` or `mainButton.state`.

The `@tma.js/signals` package was removed, and the SDK doesn't export functions creating signals.
Keep your own state in Svelte stores or runes. See
[@tma.js/signals](../upgrading.md#tma-js-signals) for details.

### `isSupported` Is a Function

`isSupported` of SDK components was a signal, so it could be passed to `useSignal`. Now it is a
plain function, as support doesn't change during the application lifetime. Call it directly:

```svelte
<script lang="ts">
  import { backButton } from '@tma.js/sdk-svelte';

  // Before: const isSupported = useSignal(backButton.isSupported);
  const isSupported = backButton.isSupported();
</script>
```

The `isAvailable` signals were removed. See the
[SDK migration guide](../tma-js-sdk/migrate-from-v3.md) for their replacements.

## The Store Is Readable

`useSignal` returned a `Writable` store. `useComputed` returns a `Readable` store, so the `set`
and `update` methods are gone. Two-way bindings (`bind:value={$store}`) and assignments
(`$store = value`) are no longer supported.

::: warning
Writing to the store returned by `useSignal` never changed the SDK state: it only changed the
store value until the next SDK update. If your code did this, call the component methods instead.
:::

Before:

```ts
const isVisible = useSignal(backButton.isVisible);
isVisible.set(true);
```

After:

```ts
backButton.show();
```

Replace the `Writable` type annotations with `Readable` from `svelte/store`.

## Usage Outside Components

`useSignal` subscribed to the signal immediately and removed the subscription with `onDestroy`, so
it could be called only during a component initialization.

`useComputed` subscribes to the computed value only while the store has subscribers, and reads
the current value when the first subscriber is added. So it can be called anywhere, for example in
a separate module:

```ts
import { mainButton, useComputed } from '@tma.js/sdk-svelte';

export const isMainButtonVisible = useComputed(mainButton.isVisible);
```

::: tip
Since the store has no subscribers until it is used, there is no subscription to clean up when
a component is destroyed.
:::
