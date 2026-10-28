# @tma.js/sdk

## 4.0.0-rc.1

### Patch Changes

- f65a764: Freeze objects and arrays returned by computed values, so mutating them no longer silently changes the component state. `Computed<T>` and `useComputed` return `DeepReadonly<T>`, which is exported from `@tma.js/sdk`.
- f65a764: Bring back `viewport.isStable`. It is taken from the `is_state_stable` flag sent by Telegram and is also available in `viewport.state()`.
- @tma.js/bridge@4.0.0-rc.1
  - @tma.js/init-data@4.0.0-rc.1

## 4.0.0-rc.0

### Major Changes

- 6d4952e: Rewrite the package.

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

### Patch Changes

- Updated dependencies [6d4952e]
- Updated dependencies [6d4952e]
  - @tma.js/bridge@4.0.0-rc.0
  - @tma.js/init-data@4.0.0-rc.0

## 3.4.0

### Minor Changes

- d48041d: Add `requestChat` function and `forceRequest` option of the `openTelegramLink` function.
- 93317ef: Add `serverless` component allowing to call endpoints of the bot's Serverless project, and `ServerlessError`.

### Patch Changes

- Updated dependencies [2d454d9]
  - @tma.js/bridge@2.4.0

## 3.3.0

### Minor Changes

- f61770a: Allow domains telegram.dog and telegram.me to be used in openTelegramLink. Use telegram.me for redirect instead of t.me. Add tests

## 3.2.3

### Patch Changes

- Updated dependencies [279de3a]
  - @tma.js/transformers@1.2.0
  - @tma.js/bridge@2.3.3

## 3.2.2

### Patch Changes

- Updated dependencies [5823079]
  - @tma.js/bridge@2.3.2

## 3.2.1

### Patch Changes

- b6b3243: Set button type to "default" if it was omitted in Popup.
- Updated dependencies [2ba6ea0]
  - @tma.js/bridge@2.3.1

## 3.2.0

### Minor Changes

- 2d24b83: added support for icon_custom_emoji_id in bottom buttons

### Patch Changes

- Updated dependencies [2d24b83]
  - @tma.js/bridge@2.3.0

## 3.1.9

### Patch Changes

- Updated dependencies [ca81d1b]
  - @tma.js/bridge@2.2.5

## 3.1.8

### Patch Changes

- e9ea686: Bump `error-kid`.
- Updated dependencies [e9ea686]
  - @tma.js/bridge@2.2.4

## 3.1.7

### Patch Changes

- 8ecc358: Set correct values for exported `request` and `request2` variables.
- Updated dependencies [1bc36a2]
  - @tma.js/bridge@2.2.3

## 3.1.6

### Patch Changes

- ae53859: Update README.md

## 3.1.5

### Patch Changes

- 805c0fa: Simplify usage of fp-ts to potentially avoid building problems in some applications.
- Updated dependencies [805c0fa]
  - @tma.js/transformers@1.1.3
  - @tma.js/toolkit@1.0.4
  - @tma.js/bridge@2.2.2

## 3.1.4

### Patch Changes

- 3f233d2: Export request2 and request2fp.

## 3.1.3

### Patch Changes

- 22eed1e: Add side-effect free markers for functions and errors.
- Updated dependencies [22eed1e]
  - @tma.js/toolkit@1.0.3
  - @tma.js/bridge@2.2.1
  - @tma.js/transformers@1.1.2

## 3.1.2

### Patch Changes

- 8199706: When opening QrScanner, update the isOpened flag. Listen to its changes to resolve the promise. After the promise was resolved, update the flag again.

## 3.1.1

### Patch Changes

- 2ff218a: Save raw colors instead of computed ones when calling MiniApp's color setters.

## 3.1.0

### Minor Changes

- 6b6218d: Implement `DeviceStorage` and `SecureStorage`.

### Patch Changes

- Updated dependencies [6fc38d4]
- Updated dependencies [a5333d9]
  - @tma.js/bridge@2.2.0

## 3.0.8

### Patch Changes

- 7ab459c: Set `SwipeBehavior.isVerticalEnabled` initial value as true.

## 3.0.7

### Patch Changes

- Updated dependencies [9b46673]
  - @tma.js/bridge@2.1.3

## 3.0.6

### Patch Changes

- bd78481: - fix(MiniApp): apply state changes when calling `setHeaderColor` method
  - fix(MiniApp): fix improper logic updating colors when theme changes

## 3.0.5

### Patch Changes

- 95ae14e: Don't use values from theme params when mounting MiniApp. Also, don't call setters when the component mounted

## 3.0.4

### Patch Changes

- c6d9303: Make `ifAvailable` always return `option.Option<AnyEither>` instead of `option.Option<Plain>`

## 3.0.3

### Patch Changes

- Updated dependencies [458cd03]
  - @tma.js/bridge@2.1.2

## 3.0.2

### Patch Changes

- 58793e3: Re-export `emitEvent` from `@tma.js/bridge`.

## 3.0.1

### Patch Changes

- 4570643: Update package.json actualizing all paths.
- Updated dependencies [4570643]
  - @tma.js/transformers@1.1.1
  - @tma.js/signals@1.0.1
  - @tma.js/toolkit@1.0.2
  - @tma.js/bridge@2.1.1
  - @tma.js/types@1.0.2
