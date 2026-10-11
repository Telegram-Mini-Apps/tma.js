# Migrating from 2.x

This guide covers the migration from `@tma.js/bridge` 2.x to the current major version. Go through
it top to bottom: each section lists what changed, shows the code before and after, and points out
changes that TypeScript can't catch.

If you also use other `@tma.js` packages, see the [upgrading overview](../upgrading.md) and the
[@tma.js/sdk migration guide](../tma-js-sdk/migrate-from-v3.md).

## Overview

The set of Mini Apps methods and events, as well as their release versions, stayed the same. The
API around them changed:

- **No fp-ts.** All `*Fp` functions returning `Either` or `TaskEither` were replaced with `safe*`
  functions returning a plain `Result` object.
- **No `BetterPromise`.** Asynchronous functions return native promises. Cancellation is performed
  with an `AbortSignal` passed in the `signal` option. `CancelledError` was removed.
- **No reactive values.** The `debug`, `targetOrigin`, `logger` and `postMessageImpl` values were replaced
  with plain getter and setter functions.
- **Events API renamed.** `on` and `off` became `onEvent` and `offEvent`, the `'*'` wildcard became
  `onAnyEvent` and `offAnyEvent`. Options are passed in an object.
- **`request2` became `request`.** The old `request` was removed. With a list of events, the result
  is always `{ event, payload }`.
- **`tgWebAppData` is a raw string.** Launch parameters no longer contain parsed init data.
- **`mockTelegramEnv` changed.** The `onEvent` option became `onMethod`, and the function returns
  a function reverting the mock.
- **IIFE global renamed.** When loaded via a `<script>` tag, the package is exposed as the
  `tmajs.bridge` global instead of `tapps.bridge`.
- **Dependencies.** `fp-ts`, `better-promises`, `mitt`, `@tma.js/signals`, `@tma.js/toolkit`,
  `@tma.js/transformers` and `@tma.js/types` are no longer dependencies.

::: warning Changes TypeScript can't catch
Most of the changes below make the compilation fail, so the compiler guides you through them.
Sections marked with a warning container describe changes in behavior that compile successfully
but work differently. Review them carefully. If you use the package from JavaScript, without type
checking, treat every change in this guide as silent.
:::

## Installation

Update the package:

::: code-group

```bash [pnpm]
pnpm i @tma.js/bridge@latest
```

```bash [npm]
npm i @tma.js/bridge@latest
```

```bash [yarn]
yarn add @tma.js/bridge@latest
```

:::

If you loaded the package from a CDN via a `<script>` tag, replace `tapps.bridge` with
`tmajs.bridge`.

If you used `fp-ts` only to work with this package, you can remove it.

## Error Handling: fp-ts to `Result`

Every function returning `Either` or `TaskEither` was replaced with a `safe` function returning
a `Result`:

```ts
type Result<E, T> =
  | { ok: true; data: T }
  | { ok: false; error: E };
```

The error type goes first, the same as in `Either`. The regular, throwing functions stayed as is.

Before:

```ts
import { requestFp } from '@tma.js/bridge';
import { function as fn, taskEither as TE } from 'fp-ts';

await fn.pipe(
  requestFp('web_app_request_phone', 'phone_requested', { timeout: 5000 }),
  TE.match(
    error => console.error(error),
    ({ status }) => console.log(status),
  ),
)();
```

After:

```ts
import { matchError, safeRequest } from '@tma.js/bridge';

const result = await safeRequest('web_app_request_phone', 'phone_requested', {
  timeout: 5000,
});
if (result.ok) {
  console.log(result.data.status);
} else {
  matchError(result.error, {
    TimeoutError: e => console.error(`No response in ${e.data.timeout}ms`),
  });
}
```

| 2.x                                   | Current                        |
|---------------------------------------|--------------------------------|
| `requestFp`, `request2Fp`             | `safeRequest`                  |
| `invokeCustomMethodFp`                | `safeInvokeCustomMethod`       |
| `retrieveLaunchParamsFp`              | `safeRetrieveLaunchParams`     |
| `retrieveRawLaunchParamsFp`           | `safeRetrieveRawLaunchParams`  |
| `retrieveRawInitDataFp`               | `safeRetrieveRawInitData`      |
| `createStartParamFp`                  | `safeCreateStartParam`         |
| `isTMAFp`                             | `isTMA`, `isTMAAsync`          |
| `postEventFp`                         | `postEvent` (throws)           |
| `decodeBase64UrlFp`                   | `decodeBase64Url` (throws)     |
| `decodeStartParamFp`                  | `decodeStartParam` (throws)    |

`safeRetrieveRawInitData` returns `string | undefined` in `data` instead of `Option<string>`.

The package also exports:

- `matchError` to handle each error by its name, with the compiler checking that every error is
  handled;
- `ok`, `err`, `unwrap` and `throwing` to work with `Result` values. `throwing(safeFn)` replaces
  the `throwifyFpFn` and `throwifyAnyEither` helpers from `@tma.js/toolkit`.

::: warning
Only expected errors, like a timeout, are returned in `Result`. `UnknownEnvError`,
`MethodUnsupportedError`, `MethodParameterUnsupportedError`, errors thrown by the `capture` and
`postEvent` options, and the abort reason are thrown even from `safe` functions. In 2.x,
`requestFp` returned `UnknownEnvError` in `Either`. Keep a `try`/`catch` where these errors may
occur.
:::

Learn more in the [Handling Errors](errors.md) article.

## Promises and Cancellation

`request`, `invokeCustomMethod` and `isTMAAsync` return native promises instead of
`BetterPromise`. The `.cancel()` method doesn't exist anymore. Pass an `AbortSignal` in the `signal`
option (formerly `abortSignal`) instead:

Before:

```ts
import { request } from '@tma.js/bridge';

const promise = request('web_app_request_phone', 'phone_requested', { timeout: 5000 });
promise.cancel();
```

After:

```ts
import { request } from '@tma.js/bridge';

const controller = new AbortController();
const promise = request('web_app_request_phone', 'phone_requested', {
  timeout: 5000,
  signal: controller.signal,
});
controller.abort();
```

::: warning
- An aborted request is rejected with `signal.reason`, not with `CancelledError`. `CancelledError`
  was removed. By default, `signal.reason` is a `DOMException` named `AbortError`.
- `TimeoutError` is now a class of this package with the `data.timeout` property. It is
  a different class than the one re-exported from `better-promises` in 2.x, so `instanceof`
  checks against the old class don't match. Use `TimeoutError.is(error)`.
- An `abortSignal` option passed in a variable (not an object literal) is silently ignored, as the
  compiler doesn't check excess properties in this case. Rename it to `signal`.
:::

## Events

| 2.x                             | Current                              |
|---------------------------------|--------------------------------------|
| `on(event, listener)`           | `onEvent(event, listener)`           |
| `on(event, listener, true)`     | `onEvent(event, listener, { once: true })` |
| `off(event, listener)`          | `offEvent(event, listener)`          |
| `off(event, listener, true)`    | `offEvent(event, listener)`          |
| `on('*', listener)`             | `onAnyEvent(listener)`               |
| `off('*', listener)`            | `offAnyEvent(listener)`              |
| `offAll()`                      | `offAll()`                           |

Before:

```ts
import { off, on } from '@tma.js/bridge';

const stop = on('viewport_changed', payload => console.log(payload));
on('back_button_pressed', () => history.back(), true);
on('*', ({ name, payload }) => console.log(name, payload));
```

After:

```ts
import { onAnyEvent, onEvent } from '@tma.js/bridge';

const stop = onEvent('viewport_changed', payload => console.log(payload));
onEvent('back_button_pressed', () => history.back(), { once: true });
onAnyEvent(({ name, payload }) => console.log(name, payload));
```

`onEvent` and `onAnyEvent` also accept the `signal` option removing the listener when the signal
is aborted:

```ts
const controller = new AbortController();
onEvent('theme_changed', console.log, { signal: controller.signal });
controller.abort();
```

`offEvent` no longer accepts the `once` argument: a listener is identified by the event name and
the function only.

Listeners of events without payload receive `undefined`. The parameter type changed from `never`
to `undefined`.

`emitEvent` accepts only known event names now. Its payload argument is typed depending on the
event name.

::: warning
- Adding the same listener of the same event twice has no effect now. In 2.x, the listener was
  called as many times as it was added.
- An error thrown by a listener is logged via the package logger and doesn't prevent other
  listeners from being called.
- Outside iframes, `emitEvent` calls `window.Telegram.WebView.receiveEvent` if it is defined, so
  the official SDK receives emitted events too. In 2.x, events were only dispatched as window
  messages.
- `popup_closed` listeners always receive an object containing `button_id` only if a button was
  pressed. For `viewport_changed` sent with `null` payload, `width` is now set to
  `window.innerWidth`.
:::

## Requests

### `request2` Became `request`

The deprecated `request` and `requestFp` functions were removed. `request2` and `request2Fp` were
renamed to `request` and `safeRequest`.

| 2.x                       | Current       |
|---------------------------|---------------|
| `request`, `request2`     | `request`     |
| `requestFp`, `request2Fp` | `safeRequest` |

If you used `request2`, just rename it. If you used the old `request` with a list of events, the
result shape changed: it is always an object with the captured `event` name and its `payload`.

Before:

```ts
import { request } from '@tma.js/bridge';

const payload = await request(
  'web_app_request_fullscreen',
  ['fullscreen_changed', 'fullscreen_failed'],
);
```

After:

```ts
import { request } from '@tma.js/bridge';

const { event, payload } = await request(
  'web_app_request_fullscreen',
  ['fullscreen_changed', 'fullscreen_failed'],
);
```

::: warning
With a list of events, code that doesn't access payload properties (for example, logs the result
or passes it to a function accepting `unknown`) still compiles, but now receives
`{ event, payload }` instead of the payload. The `capture` option receives `{ event, payload }`
for a list of events, as before.
:::

### Options

| 2.x           | Current     |
|---------------|-------------|
| `abortSignal` | `signal`    |
| `timeout`     | `timeout`   |
| `capture`     | `capture`   |
| `postEvent`   | `postEvent` |
| `params`      | `params`    |

::: warning
If the `capture` function throws, the request is now rejected with the thrown error.
:::

### `invokeCustomMethod`

The request identifier moved from the third positional argument to the `requestId` option, and it
became optional. When omitted, it is generated with the new `createRequestId` function.

Before:

```ts
import { invokeCustomMethod } from '@tma.js/bridge';

await invokeCustomMethod('getStorageKeys', {}, 'req-1', { timeout: 5000 });
```

After:

```ts
import { invokeCustomMethod } from '@tma.js/bridge';

await invokeCustomMethod('getStorageKeys', {}, { timeout: 5000 });
// or, to keep the identifier:
await invokeCustomMethod('getStorageKeys', {}, { timeout: 5000, requestId: 'req-1' });
```

::: warning
In JavaScript, the old call compiles and runs, but the options passed as the fourth argument
(including `timeout`) are ignored.
:::

The `InvokeCustomMethodFailedError` error now has the `data.error` property containing the error
returned by the method.

## Launch Parameters

### `tgWebAppData` Is a Raw String

`retrieveLaunchParams` and `parseLaunchParams` return init data in `tgWebAppData` as the raw
string passed by Telegram. In 2.x, it was a parsed object.

Before:

```ts
import { retrieveLaunchParams } from '@tma.js/bridge';

const { tgWebAppData } = retrieveLaunchParams();
console.log(tgWebAppData?.user?.id, tgWebAppData?.auth_date);
```

After:

```ts
import { retrieveLaunchParams } from '@tma.js/bridge';
import { parse } from '@tma.js/init-data';

const { tgWebAppData } = retrieveLaunchParams();
const initData = tgWebAppData ? parse(tgWebAppData) : undefined;
console.log(initData?.user?.id, initData?.auth_date);
```

To parse init data, use the [@tma.js/init-data](../tma-js-init-data.md) package, or the `initData`
component of [@tma.js/sdk](../tma-js-sdk.md). To send init data to a server, keep using
`retrieveRawInitData`.

::: warning
Code passing `tgWebAppData` to a function accepting `unknown` or `any` (for example, `JSON.stringify`
or a logger) compiles, but now receives a string. Invalid init data no longer makes launch
parameters retrieval fail, as the bridge doesn't validate it anymore.
:::

### Parsing and Serializing

The functions formerly imported from `@tma.js/transformers` are now part of the bridge:

| 2.x (`@tma.js/transformers`) | Current                                         |
|------------------------------|-------------------------------------------------|
| `parseLaunchParamsQuery`     | `parseLaunchParams`, `safeParseLaunchParams`    |
| `serializeLaunchParamsQuery` | `serializeLaunchParams`                         |
| `isLaunchParamsQuery`        | `safeParseLaunchParams(value).ok`               |

### Behavior Changes

::: warning
- The launch parameters schema is stricter: unknown parameters are not included in the result,
  and `tgWebAppPlatform` and `tgWebAppVersion` must not be empty.
- Launch parameters are saved in the session storage under the `tma.js/launch-params` key (a query
  string) instead of `tapps/launchParams` (JSON). Values saved by 2.x are not read, which matters
  only if the page is reloaded during the deployment.
- A new source is checked last: the session storage value saved by the official SDK.
- `InvalidLaunchParamsError` now has the `data.value` property, and its `cause` is optional.
:::

## Environment

| 2.x                              | Current                              |
|----------------------------------|--------------------------------------|
| `isTMA()`                        | `isTMA()`                            |
| `isTMA('complete', { timeout })` | `isTMAAsync({ timeout, signal })`    |
| `isTMAFp()`                      | `isTMA()`                            |
| `isTMAFp('complete')`            | `isTMAAsync()`                       |
| `hasWebviewProxy(window)`        | `hasWebviewProxy()`                  |

Before:

```ts
import { isTMA } from '@tma.js/bridge';

if (await isTMA('complete', { timeout: 50 })) {
  // ...
}
```

After:

```ts
import { isTMAAsync } from '@tma.js/bridge';

if (await isTMAAsync({ timeout: 50 })) {
  // ...
}
```

::: warning
In JavaScript, `isTMA('complete')` still runs, but performs the synchronous check and ignores the
arguments.
:::

`hasWebviewProxy` no longer accepts an argument and always checks the current `window`. It returns
a plain boolean instead of a type guard.

## Mocking Environment

- The `onEvent` option was renamed to `onMethod`. It receives the same `{ name, params }` object
  and the `next` function.
- The `resetPostMessage` option was removed. Instead, the function returns a function reverting the
  mock. When mocking several times, revert the mocks in the reverse order.
- The `launchParams` option accepts a query string, `URLSearchParams` or a `LaunchParams` object.
  In the object form, `tgWebAppData` must be a string.

Before:

```ts
import { emitEvent, mockTelegramEnv } from '@tma.js/bridge';

mockTelegramEnv({
  launchParams: {
    tgWebAppPlatform: 'tdesktop',
    tgWebAppVersion: '8.0',
    tgWebAppThemeParams: {},
    tgWebAppData: new URLSearchParams([['auth_date', '1'], ['hash', ''], ['signature', '']]),
  },
  onEvent({ name }, next) {
    if (name === 'web_app_request_theme') {
      return emitEvent('theme_changed', { theme_params: {} });
    }
    next();
  },
  resetPostMessage: true,
});
```

After:

```ts
import { emitEvent, mockTelegramEnv } from '@tma.js/bridge';

const restore = mockTelegramEnv({
  launchParams: {
    tgWebAppPlatform: 'tdesktop',
    tgWebAppVersion: '8.0',
    tgWebAppThemeParams: {},
    tgWebAppData: new URLSearchParams([
      ['auth_date', '1'],
      ['hash', ''],
      ['signature', ''],
    ]).toString(),
  },
  onMethod({ name }, next) {
    if (name === 'web_app_request_theme') {
      return emitEvent('theme_changed', { theme_params: {} });
    }
    next();
  },
});

// Revert the mock when it is not needed anymore.
restore();
```

::: warning
- In JavaScript, the `onEvent` option is silently ignored: method calls are not intercepted.
- Outside iframes, the mock replaces `window.TelegramWebviewProxy` with a new object instead of
  copying the existing object's properties into it. The original `postEvent` is still called by
  `next`.
:::

## Methods

`postEvent` is a single generic function now:

```ts
type PostEventFn = <M extends MethodName>(method: M, ...args: MethodArgs<M>) => void;
```

The call syntax didn't change. `createPostEvent`, `supports`, `getReleaseVersion` and
`compareVersions` work as before, with the following differences.

::: warning
- Methods without parameters are sent with an empty string as `eventData`, as the official SDK
  does. In 2.x, `eventData` was omitted. It matters only if you handle method calls yourself, for
  example, in a custom `window.TelegramWebviewProxy`. `mockTelegramEnv` passes `undefined` to
  `onMethod` in this case.
- `getReleaseVersion` returns `undefined` for unknown methods instead of `null`. Replace
  `=== null` checks with `=== undefined` or `!version`.
- `compareVersions` returns `-1 | 0 | 1` instead of `number`.
:::

The `CreatePostEventMode` type was removed. Use `'strict' | 'non-strict'`.

## Globals

The reactive values were replaced with plain functions:

| 2.x                     | Current                    |
|-------------------------|----------------------------|
| `debug()`               | `isDebug()`                |
| `setDebug(value)`       | `setDebug(value)`          |
| `targetOrigin()`        | `getTargetOrigin()`        |
| `setTargetOrigin(value)`| `setTargetOrigin(value)`   |
| `logger()`              | `getLogger()`              |
| `logger.set(value)`     | `setLogger(value)`         |
| `logger.reset()`        | `setLogger()`              |
| `postMessageImpl`       | Removed                    |
| `postMessage`           | Removed                    |
| `resetGlobals()`        | See below                  |

`resetGlobals` was removed. Reset every global separately:

```ts
import { offAll, setDebug, setLogger, setTargetOrigin } from '@tma.js/bridge';

offAll();
setDebug(false);
setLogger();
setTargetOrigin('https://web.telegram.org');
```

The logger is a plain object with the `log`, `warn` and `error` methods. The `createLogger` factory
and the `force*` methods were removed. Only `log` depends on the debug mode, while `warn` and
`error` are always printed.

```ts
import { setLogger } from '@tma.js/bridge';

setLogger({
  log: console.log,
  warn: console.warn,
  error: console.error,
});
```

::: warning
In 2.x, `setDebug(true)` added a listener of all events to log them, which made the package start
receiving events. Now, events are logged only while there is at least one event listener.
:::

## Start Parameter and Base64

- `createStartParam` throws (and `safeCreateStartParam` returns) `StartParamTooLongError` with the
  `data.length` property instead of a plain `Error`.
- `decodeStartParamFp` and `decodeBase64UrlFp` were removed. Use the throwing versions inside
  `try`/`catch`.

::: warning
`decodeBase64Url` (and so `decodeStartParam`) throws `TypeError` instead of `URIError` if the
decoded value is not a valid UTF-8 string.
:::

## Errors

| Error                             | Change                                                                       |
|-----------------------------------|------------------------------------------------------------------------------|
| `UnknownEnvError`                 | Now has a message.                                                           |
| `MethodUnsupportedError`          | Added `data: { method, version }`.                                           |
| `MethodParameterUnsupportedError` | Added `data: { method, param, version }`.                                    |
| `InvalidLaunchParamsError`        | Constructor is `(value, cause?)`, added `data: { value }`, new message.      |
| `InvokeCustomMethodFailedError`   | `name` is `'InvokeCustomMethodFailedError'`, added `data: { error }`.        |
| `TimeoutError`                    | Own class instead of the `better-promises` one, added `data: { timeout }`.   |
| `CancelledError`                  | Removed. Aborted operations are rejected with `signal.reason`.               |
| `StartParamTooLongError`          | New.                                                                         |

::: warning
The `name` of `InvokeCustomMethodFailedError` changed from `'InvokeCustomMethodError'` to
`'InvokeCustomMethodFailedError'`. Checks like `error.name === 'InvokeCustomMethodError'` no longer
match. Use `InvokeCustomMethodFailedError.is(error)`.
:::

## Removed APIs

| 2.x                                                    | Replacement                                                       |
|--------------------------------------------------------|-------------------------------------------------------------------|
| `applyPolyfills()`                                     | None. Add an `Object.hasOwn` polyfill yourself if needed.         |
| `resetGlobals()`                                       | `offAll()`, `setDebug(false)`, `setLogger()`, `setTargetOrigin()` |
| `postMessage`, `postMessageImpl`                       | None. Use `mockTelegramEnv` to intercept method calls.            |
| `createLogger`                                         | `setLogger` with your own object.                                 |
| `deepSnakeToCamelObjKeys`                              | None.                                                             |
| `CancelledError`                                       | `signal.reason`.                                                  |
| `postEventFp`, `decodeBase64UrlFp`, `decodeStartParamFp` | The throwing versions.                                          |
| Old `request`, `requestFp`                             | `request`, `safeRequest` (formerly `request2`, `request2Fp`).     |

## Types

`Methods[M]` is the method parameters type itself now, not `{ params, versionedParams }`:

```ts
// Before
type Params = Methods['web_app_open_popup']['params'];

// After
import type { MethodParams } from '@tma.js/bridge';

type Params = MethodParams<'web_app_open_popup'>;
```

Renamed types:

| 2.x                                             | Current                                            |
|-------------------------------------------------|----------------------------------------------------|
| `SubscribeListener`                             | `AnyEventListener`                                 |
| `EventWithPayload`                              | `EventNameWithPayload`                             |
| `EventWithoutPayload`                           | `EventNameWithoutPayload`                          |
| `MethodVersionedParams`                         | `MethodVersionedParam`                             |
| `RetrieveLaunchParamsResult`                    | `LaunchParams`                                     |
| `Request2Options`, `RequestOptions`             | `RequestOptions`                                   |
| `Request2Result`                                | `RequestResult`                                    |
| `Request2CaptureFn`, `RequestCaptureFn` and similar | `RequestOptions<E>['capture']`                 |

Removed types without a direct replacement: `CreateMethodParams`, `CreatePostEventMode`,
`PostEventFpFn`, `PostEventError`, `RequestFn`, `RequestFpFn`, `RequestError`, `RequestFpOptions`,
the `Request2*` function and error types, `InvokeCustomMethodFn`, `InvokeCustomMethodFpFn`,
`InvokeCustomMethodFpOptions`, `InvokeCustomMethodError`, `RetrieveLaunchParamsError`,
`RetrieveRawLaunchParamsError`, `RetrieveRawInitDataError`, `DecodeBase64UrlError`, `isTMAError`,
`PostMessage`, `DeepConvertSnakeKeysToCamelCase`, `LoggerFn`, `LoggerForceFn`, `LoggerOptions`
and `LogLevel`. Use `typeof fn` or the error classes union where needed.

The `Logger` type is now the `{ log, warn, error }` object accepted by `setLogger`.

New types: `MethodArgs`, `EventListenerPayload`, `AnyEvent`, `OnOptions`, `EmitEventArgs`,
`RequestFnArgs`, `RequestFnOptions`, `MockedMethodCall`, `MockTelegramEnvOptions`.

Types formerly imported from `@tma.js/types` moved:

| Type                                           | Package             |
|------------------------------------------------|---------------------|
| `RGB`, `Version`, `Platform`, `ThemeParams`    | `@tma.js/bridge`    |
| `LaunchParams`                                 | `@tma.js/bridge`    |
| `InitData`, `User`, `Chat`, `ChatType`         | `@tma.js/init-data` |
| `KnownThemeParamsKey`                          | Removed             |

`ThemeParams` is an interface with explicit snake_case keys now, and `section_separator_color` was
added. `Platform` no longer contains the `'web'` literal, but still accepts any string.
