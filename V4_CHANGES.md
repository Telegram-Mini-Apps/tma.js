# What changed in the new major versions of the @tma.js packages

A comparison of the previous major versions (`packages-old/*`, which is `packages/*` on the `master`
branch) with the new ones developed in the `feat/v4` branch (`packages/*`).

> The versions in `packages/*/package.json` haven't been bumped yet and still hold the old numbers
> (bridge 2.4.0, sdk 3.4.0, etc.). Below, "old" and "new" versions mean `packages-old/*` and
> `packages/*`.

## Contents

1. [Summary](#1-summary)
2. [Changes across all packages](#2-changes-across-all-packages)
3. [@tma.js/bridge](#3-tmajsbridge)
4. [@tma.js/sdk](#4-tmajssdk)
5. [@tma.js/init-data-node → @tma.js/init-data](#5-tmajsinit-data-node--tmajsinit-data)
6. [Bindings: sdk-react, sdk-vue, sdk-solid, sdk-svelte](#6-bindings-sdk-react-sdk-vue-sdk-solid-sdk-svelte)
7. [Removed packages](#7-removed-packages)
8. [What the old versions had and is gone without a replacement](#8-what-the-old-versions-had-and-is-gone-without-a-replacement)
9. [What to do before the release](#9-what-to-do-before-the-release)

---

## 1. Summary

### Packages

| Before | After | Status |
|---|---|---|
| `@tma.js/bridge` | `@tma.js/bridge` | Rewritten |
| `@tma.js/sdk` | `@tma.js/sdk` | Rewritten |
| `@tma.js/init-data-node` (+ `/web`) | **`@tma.js/init-data`** | Renamed and rewritten |
| `@tma.js/sdk-react` / `-vue` / `-solid` / `-svelte` | same names | `useSignal` → `useComputed` |
| `@tma.js/signals` | — | **Removed** |
| `@tma.js/toolkit` | — | **Removed** |
| `@tma.js/transformers` | — | **Removed** |
| `@tma.js/types` | — | **Removed**, the types moved to bridge and init-data |

### What users will notice most

1. **No fp-ts.** All `xFp()` functions with `Either`/`TaskEither` are replaced with `safeX()`, which
   return a `Result` of the form `{ ok: true, data } | { ok: false, error }`. Plain `x()` functions
   still throw.
2. **No `BetterPromise`.** A regular `Promise` is used everywhere. Cancellation goes through the
   standard `AbortSignal` (the `signal` option instead of `abortSignal`), and `.cancel()` and
   `CancelledError` are gone.
3. **No `@tma.js/signals`.** Reactive values are now `Computed<T>` with a single method,
   `subscribe((next, prev) => …)`, which returns an unsubscribe function. `.sub`, `.unsub`,
   `.unsubAll`, `once` and the public `signal()`/`computed()`/`batch()` are removed.
4. **No `isAvailable()` / `ifAvailable()`.** Only `isSupported()` (a plain function, not a signal)
   and `supports(feature)` remain. Calling an unsupported method, a method before `init()` or a
   method of an unmounted component throws.
5. **SDK components are plain singleton objects**, not classes with DI options. `new BackButton(...)`,
   `instanceof` and the `*Options` types no longer exist.
6. **`init()` is required for everything.** In the old version some functions worked without
   `init()`. Now they throw `NotInitializedError`.
7. **`LaunchParams.tgWebAppData` is a raw string**, not a parsed object. Use `@tma.js/init-data` or
   the SDK's `initData` component to parse it.
8. **The bridge IIFE global is renamed.** The IIFE build (`dist/index.iife.js`) is still there, but
   bridge is now available as `tmajs.bridge` instead of `tapps.bridge`. The SDK is still
   `tmajs.sdk`, and `@tma.js/init-data` got the `tmajs.initData` global.
9. **Dependencies.** `fp-ts`, `better-promises`, `mitt` and the internal signals, toolkit,
   transformers and types packages are removed. `error-kid` is upgraded from 2 to 3, `valibot` from
   ^1.1 to ^1.5.

---

## 2. Changes across all packages

### 2.1 Error handling: fp-ts → Result

```ts
// Before
import { requestFp } from '@tma.js/bridge';
import { taskEither as TE, function as fn } from 'fp-ts';

await fn.pipe(
  requestFp('web_app_request_phone', 'phone_requested', { timeout: 5000 }),
  TE.match(err => console.error(err), ({ status }) => console.log(status)),
)();

// After
import { safeRequest, matchError } from '@tma.js/bridge';

const r = await safeRequest('web_app_request_phone', 'phone_requested', { timeout: 5000 });
if (r.ok) {
  console.log(r.data.status);
} else {
  matchError(r.error, { TimeoutError: e => console.error(e.data.timeout) });
}
```

- In `Result<E, T>` the error type comes **first**.
- Bridge exports the `ok`, `err`, `unwrap` and `throwing` helpers. `throwing(safeX)` turns a safe
  function into a throwing one.
- `matchError` from error-kid v3 matches errors by name and checks that every variant is handled.
- **Important:** only *expected* errors end up in a `Result`, such as a timeout, a user refusal or an
  invalid response. Environment and misuse errors are thrown even from `safeX`: `UnknownEnvError`,
  `MethodUnsupportedError`, `NotInitializedError`, `NotMountedError`, `ConcurrentCallError`, and
  cancellation via `signal.reason`.
- Not every function has a safe variant. If there are no expected errors, there is no safe version,
  for example for `hideKeyboard`, `shareStory`, `shareURL` and `decodeStartParam`.

### 2.2 Async: BetterPromise → Promise + AbortSignal

```ts
// Before
const p = request('web_app_request_phone', 'phone_requested', { timeout: 5000 });
p.cancel(); // CancelledError

// After
const ac = new AbortController();
const p = request('web_app_request_phone', 'phone_requested', { signal: ac.signal, timeout: 5000 });
ac.abort(); // the promise rejects with ac.signal.reason
```

- The `abortSignal` option is renamed to `signal`.
- `TimeoutError` is now bridge's own error-kid class with a `.data.timeout` field. It's a **different
  class**, so old `instanceof` checks against `TimeoutError` from better-promises won't work.

### 2.3 Errors on error-kid v3

- Every error class has a static `.is(value)` method. It checks a tag, so it works across realms and
  when the package is duplicated in a bundle.
- Most errors got a `.data` field with structured data, and the messages are more informative.

### 2.4 sessionStorage keys

| What | Before | After |
|---|---|---|
| Launch params | `tapps/launchParams` (JSON) | `tma.js/launch-params` (query string) |
| SDK component state | `tapps/<name>` | `tma.js/sdk/<name>` |

After the upgrade, previously saved state won't be picked up. This only matters when the page is
reloaded within one session during the rollout.

### 2.5 Build

- Formats: `es` + `cjs`, plus `iife` (`dist/index.iife.js`) for bridge, SDK and init-data. It's built
  by a separate `vite build --mode iife` pass and bundles all dependencies. Globals: `tmajs.bridge`
  (formerly `tapps.bridge`), `tmajs.sdk`, `tmajs.initData`. The framework bindings have no IIFE, as
  before.
- `exports` got the `"@tma.js/source": "./src/index.ts"` condition. It's needed for development in
  the monorepo, and in the published package it points to a missing file, because only `dist` is
  published. Users aren't affected unless they enable this condition themselves.
- `sideEffects: false`, as before.
- Only `@tma.js/init-data` declares `engines` (`node >= 20`).

---

## 3. @tma.js/bridge

The sets of Mini Apps methods (63) and events (62) **haven't changed**, and the release versions
table is identical too. The API around them changed.

### 3.1 Renames

| Before | After |
|---|---|
| `on(event, fn, once?)` | `onEvent(event, fn, { once?, signal? })` |
| `off(event, fn, once?)` | `offEvent(event, fn)` |
| `on('*', fn)` / `off('*', fn)` | `onAnyEvent(fn, opts)` / `offAnyEvent(fn)` |
| `request2` / `request2Fp` | `request` / `safeRequest` |
| `requestFp` | `safeRequest` |
| `invokeCustomMethodFp` | `safeInvokeCustomMethod` |
| `isTMA('complete', opts)` | `isTMAAsync({ timeout?, signal? })` |
| `isTMAFp` | — (use `isTMA()` / `isTMAAsync()`) |
| `retrieveLaunchParamsFp` and other `retrieve*Fp` | `safeRetrieveLaunchParams`, `safeRetrieveRawLaunchParams`, `safeRetrieveRawInitData` |
| `createStartParamFp` | `safeCreateStartParam` |
| `debug()` (signal) | `isDebug()` |
| `targetOrigin()` (signal) | `getTargetOrigin()` |
| `logger()` / `logger.set(x)` | `getLogger()` / `setLogger(x)` |
| `mockTelegramEnv({ onEvent })` | `mockTelegramEnv({ onMethod })` |
| `parseLaunchParamsQuery` (transformers) | `parseLaunchParams` / `safeParseLaunchParams` |
| `serializeLaunchParamsQuery` (transformers) | `serializeLaunchParams` |
| `SubscribeListener` type | `AnyEventListener` |
| `EventWithPayload` / `EventWithoutPayload` types | `EventNameWithPayload` / `EventNameWithoutPayload` |
| `MethodVersionedParams` type | `MethodVersionedParam` |
| `RetrieveLaunchParamsResult` type | `LaunchParams` |

### 3.2 Removed without a direct replacement

- `postEventFp`, `decodeBase64UrlFp`, `decodeStartParamFp`. Only the throwing versions remain.
- `resetGlobals()`. Call `offAll()`, `setDebug(false)`, `setLogger()` and
  `setTargetOrigin('https://web.telegram.org')` instead.
- `postMessage` and `postMessageImpl`.
- `applyPolyfills()` (the `Object.hasOwn` polyfill). If you need to support very old WebViews,
  include the polyfill yourself.
- Re-exports of `createLogger`, `deepSnakeToCamelObjKeys`, `CancelledError` and the `Logger*` /
  `LogLevel` / `DeepConvertSnakeKeysToCamelCase` types.

### 3.3 Behavior changes

**`request`**

- Returns a `Promise`, not a `BetterPromise`.
- **With an array of events it always resolves to `{ event, payload }`**, as `request2` used to. The
  old `request` with an array returned only the payload.

  ```ts
  // Before
  const payload = await request('web_app_request_fullscreen', ['fullscreen_changed', 'fullscreen_failed']);
  // After
  const { event, payload } = await request('web_app_request_fullscreen', ['fullscreen_changed', 'fullscreen_failed']);
  ```

- An exception thrown in `capture` now rejects the request.

**`invokeCustomMethod`**: `requestId` moved from a positional argument into the options and became
optional. By default it's generated with the new `createRequestId()` function.

```ts
// Before
await invokeCustomMethod('getStorageKeys', {}, 'req-1', { timeout: 5000 });
// After
await invokeCustomMethod('getStorageKeys', {}, { timeout: 5000 });
```

**Events**

- Subscribing the same function again does nothing. In mitt, the same handler could be called
  several times.
- An exception in a handler is logged via `getLogger().error` and doesn't affect other handlers.
- For events without a payload, the handler parameter is typed as `undefined`, not `never`.
- `emitEvent` accepts only known event names. Outside an iframe it calls
  `window.Telegram.WebView.receiveEvent` if it exists, so the official SDK receives the event too.
- Payload normalization:
  - `viewport_changed` with `null` substitutes `width: window.innerWidth`;
  - `popup_closed` is normalized to `{}` or `{ button_id }`.
- In debug mode, events are logged only while there is at least one subscriber. Previously
  `setDebug(true)` subscribed to all events by itself.

**`postEvent`**

- The signature is now a single generic function `<M>(method: M, ...args: MethodArgs<M>)`.
- A method without parameters is sent with `eventData: ""`, as in the official SDK. Previously
  `eventData` was absent.

**Launch params**

- **`tgWebAppData` is now a string**, not a parsed `InitData`.
- The schema is stricter: unknown keys are stripped (`object` instead of `looseObject`), and
  `tgWebAppPlatform` and `tgWebAppVersion` must be non-empty.
- An invalid `tgWebAppData` no longer breaks retrieving launch params, because bridge doesn't
  validate it.
- A fourth source is added: the official SDK's `sessionStorage['__telegram__initParams']`.

**`mockTelegramEnv`**

- Returns a restore function.
- The `onEvent` option → `onMethod(call, next)`, `resetPostMessage` is removed.
- `launchParams` accepts `string | URLSearchParams | LaunchParams`.

**Other**

- `getReleaseVersion` returns `undefined` instead of `null` for an unknown method.
- `compareVersions` returns the `-1 | 0 | 1` type.
- `hasWebviewProxy()` no longer takes an argument and checks `window`.
- `createStartParam` throws `StartParamTooLongError` instead of a plain `Error`.
- `decodeBase64Url` throws `TypeError` instead of `URIError` on invalid UTF-8.
- Logger: `setLogger({ log, warn, error })`. The `createLogger` factory and the `force*` methods are
  gone. Only `log` depends on debug, while `warn` and `error` are always printed.

### 3.4 Types

- `Methods[M]` is now the parameters type itself, not `{ params, versionedParams }`. Code like
  `Methods[M]['params']` must be changed to `MethodParams<M>`.
- New types: `MethodArgs<M>`, `EventListenerPayload`, `AnyEvent`, `OnOptions`, `EmitEventArgs`,
  `RequestFnArgs`, `RequestFnOptions`, `MockedMethodCall`.
- `RGB`, `Version`, `Platform` and `ThemeParams` moved here from `@tma.js/types`.
- `ThemeParams` is now an interface with explicit snake_case keys. `section_separator_color` is added
  to it, and `KnownThemeParamsKey` is removed.
- `Platform` no longer contains the `'web'` literal, but stays `| string`, so this isn't a breaking
  change.

### 3.5 Errors

| Before | After |
|---|---|
| `UnknownEnvError` (no message) | Has a message |
| `MethodUnsupportedError`, `MethodParameterUnsupportedError` | `.data` added |
| `InvalidLaunchParamsError(lp, cause)` | `(value, cause?)`, `.data.value`, new message |
| `InvokeCustomMethodFailedError` with `name = 'InvokeCustomMethodError'` | **`name` = `'InvokeCustomMethodFailedError'`** |
| `TimeoutError` from better-promises | Own class, `.data.timeout` |
| `CancelledError` | Removed, cancellation rejects the promise with `signal.reason` |
| — | New `StartParamTooLongError` |

---

## 4. @tma.js/sdk

### 4.1 Component shape

```ts
// Before
backButton.mount.ifAvailable();
if (backButton.show.isAvailable()) {
  backButton.show();
}
const off = backButton.isVisible.sub(v => console.log(v));
backButton.onClick(handler, true); // once

// After
if (backButton.isSupported()) {
  backButton.mount();
  backButton.show();
}
const off = backButton.isVisible.subscribe((next, prev) => console.log(next));
backButton.onClick(handler, { once: true });
```

- Components are singleton objects. Only their TS interfaces are exported.
- All `*Fp`, all `isAvailable` and `ifAvailable`, and all `*Options` DI types (`BackButtonOptions`,
  `MiniAppOptions`, etc.) are removed.
- Every button got a `state: Computed<S>` field.

### 4.2 Initialization

```ts
// Before
init({ version: '8.0', isInlineMode: false, themeParams: {...}, postEvent: postEventFp });
initFp(opts); // Either

// After
init({
  launchParams: { tgWebAppVersion: '8.0', tgWebAppPlatform: 'tdesktop', tgWebAppThemeParams: {...} },
  postEvent, // PostEventFn, throwing
  acceptCustomStyles: true,
});
safeInit(opts); // Result<LaunchParamsRetrieveError, VoidFunction>
isInitialized(); // new
```

- The `version`, `isInlineMode` and `themeParams` options are removed. Pass the whole `launchParams`
  instead.
- The default `postEvent` is now `createPostEvent(version)` in strict mode, i.e. **with a version
  check**: an unsupported method throws `MethodUnsupportedError`. The old default didn't check the
  version.
- Handling `reload_iframe`, custom styles and sending `iframe_ready` happen only inside an iframe.
- A repeated `init()` first cleans up after the previous call.

**A breaking change that's easy to miss.** In the old version many functions only checked `isTMA()`
and worked **without `init()`**: `closingBehavior`, `themeParams`, `mainButton`, `miniApp.mount`,
`close`, `ready` and `bindCssVars`, `viewport.mount`, `expand` and `bindCssVars`, `openLink`,
`sendData`, `shareURL`, `initData.restore`. **Now all of them throw `NotInitializedError` before
`init()` is called.**

### 4.3 Availability checks

| Before | After |
|---|---|
| `fn.isAvailable()` — reactive signal (TMA + init + support + mounted) | — |
| `fn.ifAvailable(...args)` | — |
| `fn.isSupported()` — signal | `fn.isSupported()` — **plain function**: init + client support. **Doesn't check** mounting |
| `fn.supports(key)` — only on `miniApp.setHeaderColor` | `supports()` exists on `openLink`, `miniApp.close`, `miniApp.setHeaderColor`, `mainButton.setParams`, `secondaryButton.setParams` |
| `FunctionUnavailableError` | `NotInitializedError`, `MethodUnsupportedError`, `MethodParameterUnsupportedError`, `NotMountedError` |

A replacement for `ifAvailable` on a method that needs a mounted component:
`if (x.isSupported() && x.isMounted()) x.method()`.

`isSupported()` appeared for the first time on `mainButton`, `closingBehavior`, `deviceStorage` and
`secureStorage`.

### 4.4 Reactivity

- The `Computed<T>` type is `x()` plus `x.subscribe((next, prev) => void) → unsubscribe`.
- A listener is called only when the value changes (`Object.is`) and is **not** called on subscribe.
- Sources are subscribed to lazily, only while the value has listeners.
- The value reference is preserved until the value changes, so `Computed` is compatible with
  `useSyncExternalStore(x.subscribe, x)`.
- There are no public `computed` and `batch`. Users who built their own computed values from SDK
  signals will need a third-party library.

### 4.5 Mounting

| | Before | After |
|---|---|---|
| Async mount (viewport, biometry, locationManager) | `BetterPromise` / `TaskEither` | `Promise` + `safeMount()` → `Result<TimeoutError, void>` |
| `isMounting` | didn't exist | **new** `Computed<boolean>` |
| `unmount` during an async mount | didn't cancel the mount | cancels it |
| Restoring from sessionStorage | on every mount after a reload | only on the first mount after a reload |
| `miniApp.mount()` | didn't touch themeParams | **mounts `themeParams` automatically** |

Calling a method of an unmounted component throws `NotMountedError`.

### 4.6 Per-component changes

**Buttons (back, settings, main, secondary)**

- `onClick(fn, once?)` → `onClick(fn, { once?, signal? })`, `offClick(fn, once?)` → `offClick(fn)`.
  Neither of them ever throws anymore.
- `mainButton` and `secondaryButton` are described by the shared `BottomButton<S>` type.
- `iconCustomEmojiId` is now `string | undefined` (was `''`). Unset parameters aren't sent to
  Telegram.
- Default `secondaryButton.bgColor`: was `bottomBarColor || '#000000'`, now
  `bottomBarColor || themeParams.secondaryBgColor || '#ffffff'`.

**miniApp**

- New methods: `safeSetBgColor`, `safeSetBottomBarColor`, `safeSetHeaderColor` and
  `close.supports('returnBack')`.
- Colors are parsed with `safeToRGB`. `#RGB`, `#RGBA`, `#RRGGBBAA`, `rgb()` and `rgba()` are
  accepted.
- `bottom_bar_bg_color` falls back to `secondary_bg_color`, as in the official SDK.
- `close(false)` sends `{}` instead of `{ return_back: false }`.
- `isActive` is initially `true`.
- **`mount()` no longer sets `headerColor` to `'header_bg_color'`**: the header color stays
  `'bg_color'`, as in the official SDK. This changes `headerColorRgb`.
- `isDark` is `false` if the color is unknown or invalid.

**themeParams**

- **`isDark` is now `false` when `bg_color` is missing**, previously it was `true`.
- The `theme_changed` event **replaces** the whole state. Previously new values were merged with the
  old ones.
- Fixed a bug where CSS variables weren't removed when unbinding them.

**viewport**

- Removed `isStable`, as well as `safeAreaInsetTop/Bottom/Left/Right` and
  `contentSafeAreaInsetTop/Bottom/Left/Right`. Use `safeAreaInsets()` and `contentSafeAreaInsets()`.
  The corresponding CSS variables are still set.
- New methods: `safeRequestFullscreen`, `safeExitFullscreen`, `isMounting` and `safeMount`.
- `bindCssVars` now requires the component to be mounted.

**initData**

- The data is taken from the `tgWebAppData` string and parsed with `@tma.js/init-data`.
- Added `safeRestore()`.

**biometry**

- **`requestAccess()` returns `accessGranted`.** Previously it mistakenly returned
  `accessRequested`.
- The `state.token` field is removed: the token is only returned from `authenticate`.
- `NotAvailableError` → `BiometryUnavailableError`.
- A concurrent second call of `authenticate`, `requestAccess` or `updateToken` throws
  `ConcurrentCallError`.
- `updateToken` updates `tokenSaved`.

**locationManager**

- The `LocationManagerRequestLocationResponse` type → `LocationData`.
- New: `isMounting`, `safeMount`, `safeRequestLocation`.
- The state is updated on the `location_checked` event.

**popup**

- Types `ShowOptions` → `PopupShowOptions`, `ShowOptionsButton` → `PopupShowButton`.
- New `safeShow` and the `preparePopupParams` helper.

**invoice**

- New `safeOpenSlug` and `safeOpenUrl`.
- An invalid URL returns `InvalidArgumentsError`.

**qrScanner**

- New `safeOpen` and `safeCapture`.
- The `capture` option is now optional: by default the scanner takes the first QR code it finds.
- A timeout or cancellation closes the scanner.

**cloudStorage**

- The `getItem(keys[])` overload is removed. Use `getItems`.
- Method options: `{ signal, timeout }`.

**deviceStorage / secureStorage**

- Added `isSupported()` and the `{ signal, timeout }` options.
- Errors are now `XMethodError | TimeoutError`.

**serverless**

- `abortSignal` → `signal`.
- Missing init data throws `InvalidEnvError` instead of returning it.

**In all components**, `ConcurrentCallError` (popup, invoice, qrScanner, biometry) is now **thrown**
instead of being returned as an error.

### 4.7 Functions

The general rule: `xFp` → `safeX`. The throwing `x` stays and gets `.isSupported()`.

- No safe variant: `hideKeyboard`, `shareStory`, `switchInlineQuery`, `addToHomeScreen`, `shareURL`.
- `switchInlineQuery` throws `InvalidEnvError` outside inline mode, and its `isSupported()` takes
  inline mode into account.
- `requestContact`:
  - the `RequestedContactCompleteData` type → `RequestedContactComplete`;
  - the timeout covers the whole operation;
  - responses from the macOS client, where the JSON comes wrapped in quotes, are handled.
- `getCurrentTime`: `ValidationError` → `InvalidResponseError`.
- New exports: `isTelegramHostname`, `preparePopupParams`.
- **SDK wrappers over bridge are removed:** `postEvent`, `request`, `request2` and
  `invokeCustomMethod`, which substituted the `postEvent` from `init()`. These names are now
  re-exported directly from bridge and **don't use** the `postEvent` passed to `init()`. If you need
  it, pass `{ postEvent }` explicitly.

### 4.8 Colors

| Before | After |
|---|---|
| `isColorDark`, `isColorDarkFp` | `isColorDark`, `safeIsColorDark` |
| `toRGB`, `toRGBFp`, `toRGBFull`, `toRGBFullFp`, `isRGB`, `isRGBShort`, `isRGBA`, `isRGBAShort`, `isAnyRGB` | `toRGB`, `safeToRGB`, `isRGB`, `InvalidColorError` error |

`toRGB` still drops the alpha channel, and `toRGBFull` (conversion to `#RRGGBBAA`) is removed. The
`InvalidColorError` error and `safeToRGB` are new.

### 4.9 Errors

| Before | After |
|---|---|
| `FunctionUnavailableError` (`name = 'FunctionNotAvailableError'`) | Removed → `NotInitializedError`, `NotMountedError`, `MethodUnsupportedError`, `MethodParameterUnsupportedError` |
| `NotAvailableError` | `BiometryUnavailableError` |
| `ValidationError` | `InvalidResponseError` (`.data.value`, ValiError in `cause`) |
| `ServerlessError(message, { …, cause })` | `ServerlessError(message, { status, type?, parameters? }, cause?)` |
| `UnknownThemeParamsKeyError` | `.data.key` added |
| `SetEmojiStatusError`, `ShareMessageError`, `RequestChatError`, `FullscreenFailedError` | `.data.error` added, prefixed messages |
| — | New `NotInitializedError`, `NotMountedError`, `InvalidColorError` |
| Per-function error unions (`OpenLinkError`, `ShareURLError`, etc.) | Removed. Remaining: `CloudStorageError`, `DeviceStorageError`, `SecureStorageError`, `RequestContactError`, `ServerlessCallError` |

### 4.10 Same name, different meaning

| Name | Before | After |
|---|---|---|
| `InitData` | component class | data type (class → `InitDataComponent`) |
| `ThemeParams` | component class | record type (class → `ThemeParamsComponent`) |
| `TimeoutError` | from better-promises | bridge's own class |
| `isSupported` | signal | function |

---

## 5. @tma.js/init-data-node → @tma.js/init-data

### 5.1 Package

- The package is renamed. The `./web` subpath is removed, leaving a single entry point.
- The code uses only WebCrypto: no `node:crypto` and no `Buffer`. It works in Node 20+, Bun, Deno
  and Cloudflare Workers.
- **Everything is async now.** There is no synchronous Node API (`validate`, `sign`, `isValid`
  without a promise) anymore.

### 5.2 API

| Before | After |
|---|---|
| `parse` (throws `ValiError`) | `parse` (throws `InvalidInitDataError`, ValiError in `cause`) |
| `parseFp` | `safeParse` |
| — | **`serialize(Partial<InitData>)`** |
| `validate(value, token, opts)` → `void` | `validate(value, secret, opts)` → **`Promise<InitData>`**, returns the parsed data |
| `validateFp` | `safeValidate` |
| `isValid` (synchronous in node) | `isValid` → `Promise<boolean>` |
| `validate3rd` → `void` | `validate3rd` → `Promise<InitData>` |
| `validate3rdFp`, `isValid3rdFp`, `isValidFp`, `signFp`, `signDataFp` | `safeValidate3rd`, the rest are removed |
| `sign(data, token, authDate, options?)` | **`sign(data, secret)`**, `auth_date` is passed inside `data` (defaults to `new Date()`) |
| `signData(data: string \| ArrayBuffer, …)` | `signData(data: string, secret)` |
| `hashToken(token)` → `Buffer` / `ArrayBuffer` | `hashToken(token)` → `Promise<string>` (hex) |
| `tokenHashed: true` option | **`createSecretKey(hash, { hashed: true })`** → `CryptoKey` |
| — | `Secret = string \| CryptoKey` type: wherever a token was accepted, a ready key can be passed |
| `deepSnakeToCamelObjKeys` | Removed without a replacement |
| BetterPromise `timeout` / `abortSignal` options | Removed |

```ts
// Before (Node)
import { validate, sign } from '@tma.js/init-data-node';
validate(raw, token);
const signed = sign({ user }, token, new Date());

// After
import { validate, sign, createSecretKey } from '@tma.js/init-data';
const key = await createSecretKey(token); // can be created once and reused
const initData = await validate(raw, key);
const signed = await sign({ user, auth_date: new Date() }, key);
```

### 5.3 Behavior

- `isValid` checks only the signature and expiration. So `isValid === true` doesn't guarantee that
  `validate` passes: the data structure may still be invalid.
- `isValid3rd` now rejects on WebCrypto errors (for example, when Ed25519 isn't supported) instead of
  returning `false`.
- HMAC is compared in constant time via `crypto.subtle.verify`. Previously strings were compared.
- `sign` adds `signature` only if it's passed. Previously `signature=` was always sent.
- The `InitData` schema:
  - the `signature` field is now **optional**, previously parsing failed without it;
  - the `chat_join_request_query_id` field is added;
  - **unknown keys are stripped** (`object` instead of `looseObject`);
  - for repeated keys in the query, the first value is taken;
  - keys are still snake_case, and `auth_date` is still a `Date`.

### 5.4 Errors

| Before | After |
|---|---|
| `SignatureMissingError(thirdParty: boolean)` | `SignatureMissingError('hash' \| 'signature')`, `.data.param` |
| `ExpiredError` | `now` added to `.data` |
| `HexStringLengthInvalidError` | Removed, `createSecretKey` throws `TypeError` |
| — | New `InvalidInitDataError` |

---

## 6. Bindings: sdk-react, sdk-vue, sdk-solid, sdk-svelte

All bindings re-export `@tma.js/sdk`, so the SDK changes from section 4 apply to them too. The
`useSignal(signal)` hook is replaced with **`useComputed(computed)`**. It only accepts a `Computed`
from the new SDK, not any object with `.sub`.

**`@tma.js/sdk` moved from `dependencies` to `peerDependencies`** in all bindings, so it has to be
installed explicitly: `pnpm i @tma.js/sdk @tma.js/sdk-react`. This keeps a single copy of the SDK
in the application, as its components are singletons with their own state.

| Package | Changes |
|---|---|
| **React** | `useComputed` is built on `useSyncExternalStore`. **The `camelCase` argument is removed from `useLaunchParams()`**, and the hook returns the new `LaunchParams`, where `tgWebAppData` is a string. `useRawLaunchParams`, `useRawInitData`, `useAndroidDeviceData` and `useAndroidDeviceDataFrom` are unchanged. **React 17 support is dropped**: the peer dependency is `^18 \|\| ^19`. |
| **Vue** | Returns a `Readonly<Ref<T>>` built on `shallowRef`: objects aren't wrapped in a deep proxy and keep their identity. The hook works in any effect scope, not only in a component. Peer dependency `vue ^3.2`. |
| **Solid** | Works outside components. Function values are no longer mistaken for an updater. |
| **Svelte** | Returns a **`Readable`** instead of a `Writable`, so `.set` and `.update` are gone. The subscription is lazy, and the hook can be called anywhere. The peer dependency is widened to `svelte ^3 \|\| ^4 \|\| ^5`. |

---

## 7. Removed packages

### @tma.js/signals

- Removed: `signal`, `computed`, `batch` and the `Signal`, `Computed`, `SignalOptions` types.
- Replacement: only the `Computed` type from `@tma.js/sdk`, with no factories. Custom signals will
  have to be built on a third-party library.

### @tma.js/toolkit

| Before | After |
|---|---|
| Case conversion utilities (`snakeToCamel`, `deepSnakeToCamelObjKeys`, etc.) and their types | Removed without a replacement |
| `createLogger` | `setLogger` / `getLogger` in bridge, no factory |
| `getStorageValue` / `setStorageValue` | Removed |
| fp-ts helpers (`throwifyFpFn`, etc.) | The `Result` model in bridge |
| Utility types (`If`, `Maybe`, `IsNever`, etc.), `createCbCollector` | Removed |

### @tma.js/transformers

| Before | After |
|---|---|
| Valibot schemas (`initData()`, `launchParams()`, `themeParams()`, etc.) | **No longer public** |
| `parseInitDataQuery` / `serializeInitDataQuery` | `parse` / `serialize` from `@tma.js/init-data` |
| `parseLaunchParamsQuery` / `serializeLaunchParamsQuery` | `parseLaunchParams` / `serializeLaunchParams` from bridge |
| `isLaunchParamsQuery` | `safeParseLaunchParams(...).ok` or `isTMA()` |
| `pipeJsonToSchema`, `pipeQueryToSchema` | Removed, use `parseJson()` from valibot directly |
| RGB helpers | See section 4.8 |

### @tma.js/types

| Before | After |
|---|---|
| `InitData`, `User`, `Chat`, `ChatType` | `@tma.js/init-data`, re-exported from the SDK |
| `LaunchParams`, `Platform`, `Version`, `RGB`, `ThemeParams` | `@tma.js/bridge` |
| `KnownThemeParamsKey` | Removed |

---

## 8. What the old versions had and is gone without a replacement

This is worth spelling out to users separately:

- `isAvailable()`, `ifAvailable()` and the reactive `isSupported`;
- the ability to use some functions without `init()` (see 4.2);
- the `init()` options `version`, `isInlineMode`, `themeParams`;
- `viewport.isStable` and the 8 separate computed values for each inset side;
- `BiometryState.token`;
- `cloudStorage.getItem(keys[])`;
- `once`, `unsub`, `unsubAll`, and the public `computed` and `batch` of signals;
- the SDK wrappers `postEvent` and `request`, which used the `postEvent` from `init()`;
- `applyPolyfills`, the logger factory, the logger's `force*` methods;
- case conversion utilities (`deepSnakeToCamelObjKeys`) and `useLaunchParams(true)` in React;
- public valibot schemas;
- RGBA helpers (`toRGBFull`, `isRGBA`, `isAnyRGB`, etc.);
- the synchronous Node API for init data;
- `CancelledError` and `.cancel()` on promises;
- React 17 support.

Missing from both the old and the new SDK, although bridge has the methods: accelerometer,
gyroscope, device orientation, `web_app_toggle_orientation_lock`, `web_app_request_theme`.

---

## 9. What to do before the release

These items aren't API changes, but they came up during the comparison:

- **Bump the versions** in `packages/*/package.json`. They still hold the old numbers. The CDN links
  to the IIFE builds in the documentation already point to `@tma.js/bridge@3`, `@tma.js/sdk@4` and
  `@tma.js/init-data@1`, so if other numbers are chosen, they need to be fixed.
- **`@tma.js/init-data`.** This name is already taken by an old deprecated frontend package at
  version 0.2.22, and that's the version currently in `package.json`. The first release must be
  higher, for example 1.0.0.
- `packages/bridge/README.md` claims the package has no runtime dependencies, although it has
  `error-kid` and `valibot`.
- **The documentation** in `apps/docs` describes the old versions entirely (`isAvailable`, `Fp`,
  signals, `init-data-node`). It needs to be updated, and a migration guide added. There are no
  changes there on the `feat/v4` branch yet.
- `packages-old/sdk/dist` is outdated: it lacks `serverless` and `requestChat`. The comparison was
  made against the sources, and the published 3.4.0 may differ slightly.
