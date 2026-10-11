# Migrating from 3.x

This guide describes how to upgrade `@tma.js/sdk-react` from 3.x to the current major version.

The package re-exports [@tma.js/sdk](../tma-js-sdk.md), so all changes of the SDK apply to it too.
Read the [SDK migration guide](../tma-js-sdk/migrate-from-v3.md) first, as most of the work is
there. For an overview of all packages, see [Upgrading Packages](../upgrading.md).

## Peer Dependencies

`@tma.js/sdk` is now a peer dependency instead of a regular one, so install it alongside the
package:

```bash
pnpm i @tma.js/sdk @tma.js/sdk-react
```

This guarantees a single copy of the SDK in the application. The SDK components are singletons
with their own state, and a second copy would make the bindings track a state the application
never changes.

React 17 is no longer supported. The package requires `react` 18 or 19.

| Package        | 3.x                    | Current major version |
|----------------|------------------------|-----------------------|
| `react`        | `^17 \|\| ^18 \|\| ^19` | `^18 \|\| ^19`        |
| `@types/react` | `^17 \|\| ^18 \|\| ^19` | `^18 \|\| ^19`        |

## `useSignal` Replaced With `useComputed`

The `useSignal` hook was removed. Use `useComputed` instead. It works the same way: returns the
current value and re-renders the component whenever the value changes.

Before:

```tsx
import { backButton, useSignal } from '@tma.js/sdk-react';

function Component() {
  const isVisible = useSignal(backButton.isVisible);
  // ...
}
```

After:

```tsx
import { backButton, useComputed } from '@tma.js/sdk-react';

function Component() {
  const isVisible = useComputed(backButton.isVisible);
  // ...
}
```

The optional second argument, the function returning the value used during server rendering and
hydration, is still supported.

### Only SDK Computed Values Are Accepted

`useSignal` accepted any signal-like object with the `sub` method, including signals created with
`@tma.js/signals`. `useComputed` accepts only computed values (the `Computed` type) provided by the
SDK, e.g. `backButton.isVisible` or `mainButton.state`.

The `@tma.js/signals` package was removed, and the SDK doesn't export functions creating signals.
Keep your own state in React state or any state management library. See
[@tma.js/signals](../upgrading.md#tma-js-signals) for details.

### `isSupported` Is a Function

`isSupported` of SDK components was a signal, so it could be passed to `useSignal`. Now it is a
plain function, as support doesn't change during the application lifetime. Call it directly:

```tsx
// Before.
const isSupported = useSignal(backButton.isSupported);

// After.
const isSupported = backButton.isSupported();
```

The `isAvailable` signals were removed. See the
[SDK migration guide](../tma-js-sdk/migrate-from-v3.md) for their replacements.

## `useLaunchParams`

### The `camelCase` Argument Was Removed

`useLaunchParams(true)` returned launch parameters with deeply camel-cased keys, e.g.
`tgWebAppData.authDate` or `tgWebAppThemeParams.bgColor`. The argument was removed together with
the case conversion utilities. The hook always returns launch parameters as they are, and theme
parameters keys stay snake-cased.

Before:

```tsx
const lp = useLaunchParams(true);
lp.tgWebAppThemeParams.bgColor;
```

After:

```tsx
const lp = useLaunchParams();
lp.tgWebAppThemeParams.bg_color;
```

### `tgWebAppData` Is a Raw String

The hook returns the `LaunchParams` type, where `tgWebAppData` is init data in the raw format,
not a parsed object. The `RetrieveLaunchParamsResult` type was removed, use `LaunchParams`
instead.

::: warning
In TypeScript code, the compiler reports access to properties of `tgWebAppData`. In JavaScript
code, `useLaunchParams().tgWebAppData.user` silently becomes `undefined`.
:::

To work with parsed init data, use the SDK [initData](../tma-js-sdk/features/init-data.md)
component. It provides camel-cased getters, which are computed values, so read them with
`useComputed`:

Before:

```tsx
import { useLaunchParams } from '@tma.js/sdk-react';

function Profile() {
  const { tgWebAppData } = useLaunchParams(true);
  return <p>{tgWebAppData?.user?.firstName}</p>;
}
```

After:

```tsx
import { init, initData, useComputed } from '@tma.js/sdk-react';

// Once, when the application starts.
init();
initData.restore();

function Profile() {
  const user = useComputed(initData.user);
  return <p>{user?.first_name}</p>;
}
```

To send init data to your server, pass the raw string as is: `useLaunchParams().tgWebAppData` or
`useRawInitData()`. To parse it manually, use `parse` from
[@tma.js/init-data](../tma-js-init-data.md).

### Unknown Launch Parameters Are Dropped

::: warning
Previously, launch parameters unknown to the package were kept in the returned object. Now the
returned object contains only the properties of the `LaunchParams` type. To read other parameters,
parse the result of `useRawLaunchParams()` with `URLSearchParams`.
:::

## Unchanged Hooks

`useRawLaunchParams`, `useRawInitData`, `useAndroidDeviceData` and `useAndroidDeviceDataFrom`
work the same way as before.
