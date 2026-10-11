# Migrating from 3.x

This guide describes how to upgrade `@tma.js/sdk-solid` from 3.x to the current major version.

The package re-exports [@tma.js/sdk](../tma-js-sdk.md), so all changes of the SDK apply to it too.
Read the [SDK migration guide](../tma-js-sdk/migrate-from-v3.md) first, as most of the work is
there. For an overview of all packages, see [Upgrading Packages](../upgrading.md).

## Peer Dependencies

`@tma.js/sdk` is now a peer dependency instead of a regular one, so install it alongside the
package:

```bash
pnpm i @tma.js/sdk @tma.js/sdk-solid
```

This guarantees a single copy of the SDK in the application. The SDK components are singletons
with their own state, and a second copy would make the bindings track a state the application
never changes.

The `solid-js` peer dependency is unchanged: 1.x.

## `useSignal` Replaced With `useComputed`

The `useSignal` hook was removed. Use `useComputed` instead. It works the same way: returns a
Solid accessor updated whenever the value changes.

Before:

```tsx
import { backButton, useSignal } from '@tma.js/sdk-solid';

function Component() {
  const isVisible = useSignal(backButton.isVisible);
  return <p>{isVisible() ? 'visible' : 'hidden'}</p>;
}
```

After:

```tsx
import { backButton, useComputed } from '@tma.js/sdk-solid';

function Component() {
  const isVisible = useComputed(backButton.isVisible);
  return <p>{isVisible() ? 'visible' : 'hidden'}</p>;
}
```

### Only SDK Computed Values Are Accepted

`useSignal` accepted any signal-like object with the `sub` method, including signals created with
`@tma.js/signals`. `useComputed` accepts only computed values (the `Computed` type) provided by the
SDK, e.g. `backButton.isVisible` or `mainButton.state`.

The `@tma.js/signals` package was removed, and the SDK doesn't export functions creating signals.
Keep your own state in Solid's `createSignal` or `createStore`. See
[@tma.js/signals](../upgrading.md#tma-js-signals) for details.

### `isSupported` Is a Function

`isSupported` of SDK components was a signal, so it could be passed to `useSignal`. Now it is a
plain function, as support doesn't change during the application lifetime. Call it directly:

```tsx
// Before.
const isSupported = useSignal(backButton.isSupported);
isSupported();

// After.
backButton.isSupported();
```

The `isAvailable` signals were removed. See the
[SDK migration guide](../tma-js-sdk/migrate-from-v3.md) for their replacements.

## Usage Outside Components

`useSignal` always registered the cleanup with `onCleanup`, so it was meant to be called inside a
component. Outside a reactive owner, Solid warned about the cleanup that would never run.

`useComputed` registers the cleanup only inside a reactive owner, e.g. a component or
`createRoot`, and removes the subscription when the owner is disposed. Outside an owner, e.g. in
a module scope, it works without warnings, and the subscription lives as long as the application.

```ts
import { mainButton, useComputed } from '@tma.js/sdk-solid';

// Created once and shared across the application.
export const isMainButtonVisible = useComputed(mainButton.isVisible);
```

## Function Values

::: warning
`useSignal` passed new values directly to the Solid signal setter, which calls a function value
as an updater instead of storing it. `useComputed` stores values as is, so a computed value
holding a function is now returned from the accessor unchanged. If your code relied on the
previous behavior, update it.
:::
