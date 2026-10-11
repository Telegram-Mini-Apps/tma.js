---
outline: [ 2, 3 ]
---

# Upgrading Packages

This page is the starting point for upgrading `@tma.js` packages to the current major versions.
It summarizes changes affecting all packages, lists migration guides for each package, and
describes what to use instead of the removed packages.

Upgrade all `@tma.js` packages at once. Packages of the previous and the current major versions
are not compatible with each other.

## Packages

| Previous package           | Previous major | Current package          | Migration guide                                                                    |
|----------------------------|----------------|--------------------------|------------------------------------------------------------------------------------|
| `@tma.js/bridge`           | 2.x            | `@tma.js/bridge`         | [Migrating from 2.x](./tma-js-bridge/migrate-from-v2.md)                            |
| `@tma.js/sdk`              | 3.x            | `@tma.js/sdk`            | [Migrating from 3.x](./tma-js-sdk/migrate-from-v3.md)                               |
| `@tma.js/sdk-react`        | 3.x            | `@tma.js/sdk-react`      | [Migrating from 3.x](./tma-js-sdk-react/migrate-from-v3.md)                         |
| `@tma.js/sdk-solid`        | 3.x            | `@tma.js/sdk-solid`      | [Migrating from 3.x](./tma-js-sdk-solid/migrate-from-v3.md)                         |
| `@tma.js/sdk-svelte`       | 1.x            | `@tma.js/sdk-svelte`     | [Migrating from 1.x](./tma-js-sdk-svelte/migrate-from-v1.md)                        |
| `@tma.js/sdk-vue`          | 1.x            | `@tma.js/sdk-vue`        | [Migrating from 1.x](./tma-js-sdk-vue/migrate-from-v1.md)                           |
| `@tma.js/init-data-node`   | 2.x            | `@tma.js/init-data`      | [Migrating from @tma.js/init-data-node](./tma-js-init-data/migrate-from-init-data-node.md) |
| `@tma.js/signals`          | 1.x            | Removed                  | [@tma.js/signals](#tma-js-signals)                                                 |
| `@tma.js/toolkit`          | 1.x            | Removed                  | [@tma.js/toolkit](#tma-js-toolkit)                                                 |
| `@tma.js/transformers`     | 1.x            | Removed                  | [@tma.js/transformers](#tma-js-transformers)                                       |
| `@tma.js/types`            | 1.x            | Removed                  | [@tma.js/types](#tma-js-types)                                                     |

The framework bindings re-export `@tma.js/sdk`, and the SDK re-exports `@tma.js/bridge`. If you
use a binding, read the bridge and the SDK guides too, as their changes apply to it.

## Changes in All Packages

### fp-ts Replaced With `Result`

The packages no longer depend on `fp-ts`. Functions returning `Either` or `TaskEither`, named
`xFp`, were replaced with functions named `safeX`. They return a plain `Result` object:
`{ ok: true, data }` on success, or `{ ok: false, error }` on an expected failure. Functions
without the prefix still throw errors.

```ts
// Before.
import { retrieveLaunchParamsFp } from '@tma.js/sdk';
import { either as E, function as fn } from 'fp-ts';

fn.pipe(
  retrieveLaunchParamsFp(),
  E.match(
    error => console.error(error),
    lp => console.log(lp.tgWebAppPlatform),
  ),
);

// After.
import { safeRetrieveLaunchParams } from '@tma.js/sdk';

const result = safeRetrieveLaunchParams();
if (result.ok) {
  console.log(result.data.tgWebAppPlatform);
} else {
  console.error(result.error);
}
```

The `Result<E, T>` type has the error type first. `@tma.js/bridge` also exports the `ok`, `err`,
`unwrap` and `throwing` helpers to work with results.

::: warning
Only expected errors, like a timeout or invalid data, are returned in `Result`. Errors caused by
the environment or wrong usage, like calling a method before `init()`, are thrown even by
`safeX` functions.
:::

### Promises and `AbortSignal`

`BetterPromise` was replaced with the standard `Promise`. The `cancel()` method and
`CancelledError` were removed. To abort an operation, pass the standard `AbortSignal` in the
`signal` option, which replaces the `abortSignal` option. When aborted, the promise is rejected
with `signal.reason`.

```ts
// Before.
const promise = request('web_app_request_phone', 'phone_requested');
promise.cancel();

// After.
const controller = new AbortController();
const promise = request('web_app_request_phone', 'phone_requested', {
  signal: controller.signal,
});
controller.abort();
```

`TimeoutError` is now a class of `@tma.js/bridge`, so `instanceof` checks against the class from
`better-promises` no longer work.

### Signals Replaced With `Computed`

Reactive values of SDK components, like `backButton.isVisible`, were signals from
`@tma.js/signals`. Now they are computed values of the `Computed` type. Call such a value to get
its current state, and use `subscribe` to track its changes. `subscribe` returns a function
removing the listener.

```ts
// Before.
const off = backButton.isVisible.sub((current, prev) => {
  console.log(prev, '->', current);
});

// After.
const off = backButton.isVisible.subscribe((next, prev) => {
  console.log(prev, '->', next);
});
```

The `sub`, `unsub`, `unsubAll` methods and the `once` option were removed. The packages no longer
export functions creating signals. See [@tma.js/signals](#tma-js-signals) for details.

In the framework bindings, the `useSignal` hook was replaced with `useComputed`.

### `isAvailable` and `ifAvailable` Removed

The `isAvailable()` and `ifAvailable()` helpers of SDK methods were removed. Use `isSupported()`,
which is now a plain function instead of a signal, and `supports(feature)` where available. Calling
an unsupported method, a method before `init()`, or a method of an unmounted component throws an
error. See the [SDK migration guide](./tma-js-sdk/migrate-from-v3.md) for details.

### `init()` Is Required

Call `init()` from `@tma.js/sdk` (or a binding) before using any SDK functionality. Some functions
previously worked without it. Now they throw `NotInitializedError`.

### `LaunchParams.tgWebAppData` Is a Raw String

Launch parameters returned by `retrieveLaunchParams` and `parseLaunchParams` contain init data in
the raw format, not a parsed object. Pass it to your server as is. To parse it, use `parse` from
[@tma.js/init-data](./tma-js-init-data.md), or the SDK
[initData](./tma-js-sdk/features/init-data.md) component.

```ts
// Before.
retrieveLaunchParams().tgWebAppData?.user;

// After.
import { parse } from '@tma.js/init-data';

const { tgWebAppData } = retrieveLaunchParams();
tgWebAppData && parse(tgWebAppData).user;
```

### Bridge IIFE Global Renamed

The IIFE build of `@tma.js/bridge` loaded via a `<script>` tag now exposes the `tmajs.bridge`
global instead of `tapps.bridge`. The `@tma.js/sdk` global is still `tmajs.sdk`.

### Session Storage Keys Changed

The packages save launch parameters and components state in the session storage, so they survive
page reloads. The keys and the format have changed:

| Data                 | Previous key                 | Current key                         |
|----------------------|------------------------------|-------------------------------------|
| Launch parameters    | `tapps/launchParams` (JSON)  | `tma.js/launch-params` (query)      |
| SDK components state | `tapps/<component name>`     | `tma.js/sdk/<component name>`       |

Values saved by the previous versions are ignored. It matters only if the page is reloaded within
the same mini app session while the update is rolled out.

## Removed Packages

### @tma.js/signals {#tma-js-signals}

The package contained signals used by the SDK to describe the components state. The SDK now uses
its own computed values and doesn't export functions creating them.

To store your own reactive state, use the state management of your framework, or any signals
library, like [@preact/signals-core](https://github.com/preactjs/signals) or
[alien-signals](https://github.com/stackblitz/alien-signals). To connect such state with SDK
values, subscribe to them using `subscribe`.

| What it exported                       | What to use instead                                                    |
|----------------------------------------|------------------------------------------------------------------------|
| `signal`, `computed`, `batch`          | No replacement. Use your framework state or any signals library.       |
| `Computed` type                        | `Computed` type from `@tma.js/sdk`                                     |
| `Signal`, `SignalOptions` types        | No replacement                                                         |
| `SubscribeListenerFn` type             | `(next: T, prev: T) => void`                                           |
| `RemoveListenerFn` type                | `VoidFunction`                                                         |

Methods of SDK reactive values:

| Before                          | After                                                                  |
|---------------------------------|------------------------------------------------------------------------|
| `value()`                       | `value()`                                                              |
| `value.sub(listener)`           | `value.subscribe(listener)`                                            |
| `value.sub(listener, true)`     | Call the function returned by `subscribe` inside the listener          |
| `value.unsub(listener)`         | Call the function returned by `subscribe`                              |
| `value.unsubAll()`              | Call the functions returned by `subscribe`                             |
| `value.set()`, `value.reset()`  | Component methods, e.g. `backButton.show()`                            |
| `value.destroy()`               | No replacement                                                         |

```ts
// Before.
backButton.isVisible.sub(isVisible => {
  console.log('Visibility changed once:', isVisible);
}, true);

// After.
const off = backButton.isVisible.subscribe(isVisible => {
  off();
  console.log('Visibility changed once:', isVisible);
});
```

::: tip
Like before, listeners receive the next and the previous values, and are called only when the
value changes. They are not called on subscribe.
:::

### @tma.js/toolkit {#tma-js-toolkit}

The package contained internal utilities shared by other packages.

| What it exported                                                                                                                              | What to use instead                                                                                   |
|-----------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| `createLogger` and the `Logger`, `LoggerFn`, `LoggerForceFn`, `LoggerOptions`, `LogLevel` types                                                 | No factory. To replace the logger used by the packages, call `setLogger` from `@tma.js/bridge`. `getLogger` returns the current one, and `setDebug` enables debug logs. |
| `snakeToCamel`, `camelToSnake`, `snakeToKebab`, `camelToKebab`, `snakeToCamelObjKeys`, `camelToSnakeObjKeys`, `deepSnakeToCamelObjKeys` and their types | No replacement. The SDK components provide camel-cased getters, e.g. `initData.authDate`.             |
| `getStorageValue`, `setStorageValue`                                                                                                          | No replacement. Use `sessionStorage` directly.                                                        |
| `throwifyFpFn`, `throwifyAnyEither`                                                                                                           | `throwing` and `unwrap` from `@tma.js/bridge`, working with `Result`                                  |
| `BetterTaskEither` and the `fp-ts` related types (`AnyEither`, `RightOfEither`, `LeftOfEither` and others)                                     | `Result` from `@tma.js/bridge`                                                                        |
| `createCbCollector`                                                                                                                           | No replacement                                                                                        |
| Utility types: `If`, `Or`, `Maybe`, `AnyFn`, `IsNever`, `IsUndefined`, `UnionStringKeys`, `UnionRequiredKeys`, `UnionOptionalKeys`             | No replacement. Define them yourself or use a library like [type-fest](https://github.com/sindresorhus/type-fest). |

The `Logger` interface of `@tma.js/bridge` has the `log`, `warn` and `error` methods:

```ts
import { setLogger } from '@tma.js/bridge';

setLogger({
  log: (...args) => console.log('[tma.js]', ...args),
  warn: (...args) => console.warn('[tma.js]', ...args),
  error: (...args) => console.error('[tma.js]', ...args),
});
```

### @tma.js/transformers {#tma-js-transformers}

The package contained [Valibot](https://valibot.dev) schemas and functions parsing and serializing
launch parameters, init data and colors. The schemas are no longer public, and the functions moved
to other packages.

| What it exported                                                                                                                    | What to use instead                                                                                     |
|-------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| `parseLaunchParamsQuery`, `parseLaunchParamsQueryFp`                                                                                | `parseLaunchParams`, `safeParseLaunchParams` from `@tma.js/bridge`                                      |
| `serializeLaunchParamsQuery`                                                                                                        | `serializeLaunchParams` from `@tma.js/bridge`                                                           |
| `isLaunchParamsQuery`                                                                                                               | `safeParseLaunchParams(value).ok` from `@tma.js/bridge`                                                 |
| `parseInitDataQuery`, `parseInitDataQueryFp`                                                                                        | `parse`, `safeParse` from `@tma.js/init-data`                                                           |
| `serializeInitDataQuery`                                                                                                            | `serialize` from `@tma.js/init-data`                                                                    |
| `ParseLaunchParamsQueryError`, `ParseInitDataQueryError` types                                                                      | `InvalidLaunchParamsError` from `@tma.js/bridge`, `InvalidInitDataError` from `@tma.js/init-data`       |
| `LaunchParamsLike`, `InitDataLike` types                                                                                            | `LaunchParams` from `@tma.js/bridge`, `Partial<InitData>` with `InitData` from `@tma.js/init-data`      |
| `isRGB`                                                                                                                             | `isRGB` from `@tma.js/sdk`                                                                              |
| `toRGB`, `toRGBFp`                                                                                                                  | `toRGB`, `safeToRGB` from `@tma.js/sdk`                                                                 |
| `isRGBShort`, `isRGBA`, `isRGBAShort`, `isAnyRGB`                                                                                   | `safeToRGB(value).ok` from `@tma.js/sdk` checks any supported format                                    |
| `toRGBFull`, `toRGBFullFp`                                                                                                          | No replacement. Colors are converted to the `#RRGGBB` format only.                                      |
| Schemas: `launchParams`, `launchParamsQuery`, `initData`, `initDataQuery`, `initDataUser`, `initDataChat`, `themeParams`, `miniAppsMessage` | No replacement. Use the parsing functions above.                                                        |
| `InitDataGenSchema`, `InitDataGenType`, `LaunchParamsGenSchema`, `LaunchParamsGenType`, `MiniAppsMessageGenSchema`, `MiniAppsMessageGenType` types | `InitData` from `@tma.js/init-data`, `LaunchParams` from `@tma.js/bridge`                    |
| `pipeJsonToSchema`, `pipeQueryToSchema` and the `JsonToSchemaPipe`, `QueryToSchemaPipe` types                                        | No replacement. Use Valibot's `parseJson()` action directly.                                            |

`@tma.js/sdk` re-exports `@tma.js/bridge`, so the bridge functions above can be imported from the
SDK or a binding. The init data functions require installing `@tma.js/init-data`.

::: tip
Like before, `toRGB` drops the alpha channel: `toRGB('#ff000080')` returns `'#ff0000'`. For an
unknown color format, it now throws `InvalidColorError`, and `safeToRGB` returns it.
:::

### @tma.js/types {#tma-js-types}

The package contained types shared by other packages. They moved to the packages using them.

| What it exported                          | What to use instead                                                             |
|-------------------------------------------|---------------------------------------------------------------------------------|
| `InitData`, `User`, `Chat`, `ChatType`    | `@tma.js/init-data`. `@tma.js/sdk` re-exports them.                             |
| `LaunchParams`                            | `@tma.js/bridge`. `@tma.js/sdk` re-exports it. `tgWebAppData` is now a string.  |
| `Platform`, `Version`, `RGB`, `ThemeParams` | `@tma.js/bridge`. `@tma.js/sdk` re-exports them.                              |
| `KnownThemeParamsKey`                     | No replacement. `ThemeParams` lists the known keys as optional properties.      |

::: tip
The previous `@tma.js/sdk` exported the `InitData` and `ThemeParams` types as `InitDataType` and
`ThemeParamsType`, as the original names were taken by components. Now `InitData` and
`ThemeParams` are the data types, and the component types are `InitDataComponent` and
`ThemeParamsComponent`.
:::
