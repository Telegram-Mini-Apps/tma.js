---
"@tma.js/sdk": major
---

Rewrite the package.

**General**

- Remove `fp-ts`: all `xFp()` functions are replaced with `safeX()` returning `Result<E, T>`. Not every function has a safe variant (`hideKeyboard`, `shareStory`, `switchInlineQuery`, `addToHomeScreen`, `shareURL` don't).
- Remove `BetterPromise`: functions return a regular `Promise`, cancellation goes through the `signal` option (`AbortSignal`) instead of `abortSignal`.
- Remove `@tma.js/signals`. Reactive values are now `Computed<T>`: `x()` plus `x.subscribe((next, prev) => …)`, which returns an unsubscribe function. A listener is called only on change and is not called on subscribe. `.sub`, `.unsub`, `.unsubAll`, `once` and the public `signal`, `computed`, `batch` are removed. `Computed` is compatible with `useSyncExternalStore`.
- Components are singleton objects instead of classes. Only their TS interfaces are exported. All `*Options` DI types are removed.
- Remove `isAvailable()` and `ifAvailable()`. `isSupported()` is now a plain function checking initialization and client support (but not mounting), `supports(feature)` is available on `openLink`, `miniApp.close`, `miniApp.setHeaderColor`, `mainButton.setParams` and `secondaryButton.setParams`. `FunctionUnavailableError` is replaced with `NotInitializedError`, `NotMountedError`, `MethodUnsupportedError` and `MethodParameterUnsupportedError`.
- `ConcurrentCallError` (popup, invoice, qrScanner, biometry) is thrown instead of being returned.
- SDK component state is stored in sessionStorage under `tma.js/sdk/<name>` instead of `tapps/<name>`.

**Initialization**

- `init()` is required for everything. Functions that used to work without it (`closingBehavior`, `themeParams`, `mainButton`, `miniApp`, `viewport`, `openLink`, `sendData`, `shareURL`, `initData.restore`) now throw `NotInitializedError`.
- The `version`, `isInlineMode` and `themeParams` options of `init()` are replaced with `launchParams`. `initFp` → `safeInit`. Add `isInitialized()`.
- The default `postEvent` checks the method against the client version and throws `MethodUnsupportedError`.
- Handling `reload_iframe`, custom styles and `iframe_ready` happen only inside an iframe. A repeated `init()` cleans up after the previous call.

**Mounting**

- Async mounts (viewport, biometry, locationManager) return a `Promise` and have `safeMount()`. Add `isMounting`. `unmount()` cancels a pending mount.
- State is restored from sessionStorage only on the first mount after a reload.
- `miniApp.mount()` mounts `themeParams` automatically.
- Calling a method of an unmounted component throws `NotMountedError`.

**Components**

- Buttons: `onClick(fn, once?)` → `onClick(fn, { once?, signal? })`, `offClick(fn, once?)` → `offClick(fn)`, neither throws. Every button has a `state` computed. `mainButton` and `secondaryButton` share the `BottomButton<S>` type. `iconCustomEmojiId` is `string | undefined`, unset params aren't sent. Default `secondaryButton.bgColor` falls back to `themeParams.secondaryBgColor`, then `#ffffff`.
- `miniApp`: add `safeSetBgColor`, `safeSetBottomBarColor`, `safeSetHeaderColor`. Colors accept `#RGB`, `#RGBA`, `#RRGGBBAA`, `rgb()` and `rgba()`. `bottom_bar_bg_color` falls back to `secondary_bg_color`. `close(false)` sends `{}`. `isActive` is initially `true`. `mount()` no longer sets the header color to `header_bg_color`, it stays `bg_color`. `isDark` is `false` for an unknown color.
- `themeParams`: `isDark` is `false` when `bg_color` is missing. `theme_changed` replaces the whole state instead of merging. Fix CSS variables not being removed on unbind.
- `viewport`: remove `isStable` and the 8 per-side inset computeds, use `safeAreaInsets()` and `contentSafeAreaInsets()`. Add `safeRequestFullscreen` and `safeExitFullscreen`. `bindCssVars` requires the component to be mounted.
- `initData`: parsed from the `tgWebAppData` string with `@tma.js/init-data`. Add `safeRestore()`.
- `biometry`: `requestAccess()` returns `accessGranted` instead of `accessRequested`. Remove `state.token`. `NotAvailableError` → `BiometryUnavailableError`. `updateToken` updates `tokenSaved`.
- `locationManager`: `LocationManagerRequestLocationResponse` → `LocationData`, add `safeRequestLocation`, update the state on `location_checked`.
- `popup`: `ShowOptions` → `PopupShowOptions`, `ShowOptionsButton` → `PopupShowButton`. Add `safeShow` and `preparePopupParams`.
- `invoice`: add `safeOpenSlug`, `safeOpenUrl`, an invalid URL produces `InvalidArgumentsError`.
- `qrScanner`: add `safeOpen` and `safeCapture`. `capture` is optional, the first QR code is taken by default. A timeout or cancellation closes the scanner.
- `cloudStorage`: remove the `getItem(keys[])` overload, use `getItems`.
- `deviceStorage`, `secureStorage`: add `isSupported()` and the `{ signal, timeout }` options.
- `serverless`: `abortSignal` → `signal`, missing init data throws `InvalidEnvError`.

**Functions**

- `switchInlineQuery` throws `InvalidEnvError` outside inline mode.
- `requestContact`: `RequestedContactCompleteData` → `RequestedContactComplete`, the timeout covers the whole operation, macOS client responses are handled.
- `getCurrentTime`: `ValidationError` → `InvalidResponseError`.
- Add `isTelegramHostname` and `preparePopupParams`.
- Remove the SDK wrappers `postEvent`, `request`, `request2` and `invokeCustomMethod`. These names are re-exported from `@tma.js/bridge` and don't use the `postEvent` passed to `init()`.
- Colors: `toRGBFp`, `isColorDarkFp` → `safeToRGB`, `safeIsColorDark`. Remove `toRGBFull`, `isRGBShort`, `isRGBA`, `isRGBAShort`, `isAnyRGB`. Add `InvalidColorError`.

**Errors and types**

- `ValidationError` → `InvalidResponseError`. `ServerlessError` takes `(message, { status, type?, parameters? }, cause?)`. `UnknownThemeParamsKeyError`, `SetEmojiStatusError`, `ShareMessageError`, `RequestChatError` and `FullscreenFailedError` got `.data`.
- Remove per-function error unions except `CloudStorageError`, `DeviceStorageError`, `SecureStorageError`, `RequestContactError` and `ServerlessCallError`.
- `InitData` and `ThemeParams` are now data types. The component types are `InitDataComponent` and `ThemeParamsComponent`.

**Build**

- Dependencies: remove `fp-ts`, `better-promises`, `@tma.js/signals`, `@tma.js/toolkit`, `@tma.js/transformers`, `@tma.js/types`; add `@tma.js/init-data`.
