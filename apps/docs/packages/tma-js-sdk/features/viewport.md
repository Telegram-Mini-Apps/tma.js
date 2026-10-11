# 💠Viewport

A component responsible for the Telegram Mini Apps [viewport](../../../platform/viewport.md): its
size, safe areas and fullscreen mode. The viewport is available in every Telegram client, so the
component has no `isSupported` function. Fullscreen mode methods have their own.

## Mounting

Before using the component, it must be mounted. Mounting is asynchronous, as the viewport state is
requested from the Telegram client. If the page was reloaded, the state saved before the reload is
restored instead.

While mounting, the `isMounting` computed value is `true`. When the component is mounted,
`isMounted` becomes `true`.

```ts
import { viewport } from '@tma.js/sdk';

const promise = viewport.mount();
viewport.isMounting(); // true
await promise;
viewport.isMounting(); // false
viewport.isMounted(); // true
```

During mounting, the component requests:

- the viewport size. On desktop and web platforms (`macos`, `tdesktop`, `unigram`, `web`, `weba`
  and `webk`), the viewport is always stable and expanded, so the size is taken from the window
  without requesting it;
- the safe area and content safe area insets. They are requested only if the Telegram client
  supports them (since Mini Apps v8.0). Otherwise, the insets are zeros.

The fullscreen mode status is taken from the launch parameters.

`mount` accepts an optional object with the `timeout` and `signal` properties. The returned
promise is rejected with:

- `NotInitializedError` if the SDK is not initialized;
- `TimeoutError` if the Telegram client didn't respond in time;
- `signal.reason` if the signal was aborted.

The `safeMount` method returns `TimeoutError` as a result instead of throwing it:

```ts
const result = await viewport.safeMount({ timeout: 5000 });
if (!result.ok) {
  console.error('Mount failed:', result.error); // TimeoutError
}
```

Each `mount` call retrieves the state independently, and the first one to succeed mounts the
component. Calling `mount` on a mounted component does nothing.

To unmount the component, use the `unmount` method. It also cancels pending mounts, so they don't
mount the component when they complete.

```ts
viewport.unmount();
viewport.isMounted(); // false
```

While mounted, the component listens to the `viewport_changed`, `fullscreen_changed`,
`safe_area_changed` and `content_safe_area_changed` events and keeps its state up to date.

## Size

The viewport size is available via the following computed values:

```ts
viewport.height(); // number
viewport.stableHeight(); // number
viewport.width(); // number
viewport.isExpanded(); // boolean
```

`height` changes while the user is dragging the mini app, and `stableHeight` is the height in the
last stable viewport state. To learn more about the difference between them, visit the
[Viewport](../../../platform/viewport.md) page.

## Expanding

To expand the mini app to the maximum available height, use the `expand` method. It doesn't
require the component to be mounted, and throws `NotInitializedError` if the SDK is not
initialized.

```ts
viewport.expand();
```

## Fullscreen Mode

To enter fullscreen mode, use the `requestFullscreen` method. To exit it, use the `exitFullscreen`
method. Both methods are supported since Mini Apps v8.0, accept an optional object with the
`timeout` and `signal` properties, and update the `isFullscreen` computed value when the Telegram
client responds.

```ts
if (viewport.requestFullscreen.isSupported()) {
  await viewport.requestFullscreen();
  viewport.isFullscreen(); // true

  await viewport.exitFullscreen();
  viewport.isFullscreen(); // false
}
```

If the mini app is already in fullscreen mode, `requestFullscreen` succeeds.

The methods throw:

- `NotInitializedError` if the SDK is not initialized;
- `MethodUnsupportedError` if fullscreen mode is unsupported;
- `FullscreenFailedError` if the Telegram client failed to enter or exit fullscreen mode. The
  `data.error` property contains the error reported by the Telegram client;
- `TimeoutError` if the Telegram client didn't respond in time.

If the signal was aborted, the promise is rejected with `signal.reason`.

The `safeRequestFullscreen` and `safeExitFullscreen` methods return `FullscreenFailedError` and
`TimeoutError` as a result instead of throwing them:

```ts
const result = await viewport.safeRequestFullscreen({ timeout: 5000 });
if (!result.ok) {
  console.error('Failed to enter fullscreen mode:', result.error);
}
```

## Safe Area Insets

The component provides two types of insets:

- **safe area insets**, the area free from device elements, e.g. a notch;
- **content safe area insets**, the area free from Telegram UI elements, e.g. the header in
  fullscreen mode.

For more details on the difference between them, visit the
[Viewport](../../../platform/viewport.md) page.

```ts
// Objects with numeric properties "top", "bottom", "left" and "right".
viewport.safeAreaInsets(); // { top: 0, bottom: 34, left: 0, right: 0 }
viewport.contentSafeAreaInsets(); // { top: 46, bottom: 0, left: 0, right: 0 }

viewport.safeAreaInsets().top; // 0
```

## State

The component state is available via the `state` computed value.

```ts
viewport.state();
// {
//   contentSafeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
//   height: 675,
//   isExpanded: true,
//   isFullscreen: false,
//   safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
//   stableHeight: 675,
//   width: 320,
// }

const unsubscribe = viewport.height.subscribe((next, prev) => {
  console.log('Height changed:', prev, '->', next);
});
unsubscribe();
```

## Binding CSS Variables

To expose the viewport via CSS variables, use the `bindCssVars` method. The variables contain
values in pixels and are updated whenever the viewport changes. The `isCssVarsBound` computed
value reflects whether the variables are bound.

By default, the variables are named `--tg-viewport-{key}`, where `{key}` is in kebab case.

```ts
viewport.bindCssVars();
// Creates CSS variables like:
// --tg-viewport-height: 675px
// --tg-viewport-width: 320px
// --tg-viewport-stable-height: 675px
// --tg-viewport-safe-area-inset-top: 0px
// --tg-viewport-safe-area-inset-bottom: 34px
// --tg-viewport-safe-area-inset-left: 0px
// --tg-viewport-safe-area-inset-right: 0px
// --tg-viewport-content-safe-area-inset-top: 46px
// --tg-viewport-content-safe-area-inset-bottom: 0px
// --tg-viewport-content-safe-area-inset-left: 0px
// --tg-viewport-content-safe-area-inset-right: 0px

viewport.isCssVarsBound(); // true
```

The method optionally accepts a function receiving a key (`ViewportCSSVarKey`) and returning a CSS
variable name. The keys are `height`, `width`, `stableHeight`, `safeAreaInsetTop`,
`safeAreaInsetBottom`, `safeAreaInsetLeft`, `safeAreaInsetRight`, `contentSafeAreaInsetTop`,
`contentSafeAreaInsetBottom`, `contentSafeAreaInsetLeft` and `contentSafeAreaInsetRight`. If the
function returns a falsy value, the variable is not created.

```ts
viewport.bindCssVars(key => {
  // Skip the insets.
  return key.includes('Inset') ? null : `--my-prefix-${key}`;
});
// Creates CSS variables like:
// --my-prefix-height: 675px
// --my-prefix-width: 320px
// --my-prefix-stableHeight: 675px
```

`bindCssVars` returns a function removing the created variables. It throws `NotMountedError` if
the component is not mounted, and `CSSVarsBoundError` if the variables are already bound.
