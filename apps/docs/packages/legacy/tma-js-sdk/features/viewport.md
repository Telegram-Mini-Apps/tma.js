# 💠Viewport

A component responsible for the Telegram Mini Apps [viewport](../../../../platform/viewport.md).

## Mounting

Before using the component, it must be mounted.

This process is asynchronous, as viewport information needs to be requested from the Telegram application. The
`isMounting` signal will be set to `true` during the process and updated to `false` when complete.

If mounting is successful, the `isMounted` signal will be set to `true`.

```ts
try {
  const promise = viewport.mount();
  viewport.isMounting(); // true
  await promise;
  viewport.isMounting(); // false
  viewport.isMounted(); // true
} catch (err) {
  viewport.isMounting(); // false
  viewport.isMounted(); // false
}
```

To unmount, use the `unmount` method:

```ts
viewport.unmount();
viewport.isMounted(); // false
```

## Binding CSS Variables

To expose the `viewport` properties via CSS variables, use the `bindCssVars` method. The `isCssVarsBound` signal is
updated after the method is called.

This method optionally accepts a function that transforms the values `width`, `height` and `stableHeight` into CSS
variable names. By default, values are converted to kebab case with the prefix `--tg-viewport-`.

```ts
import { viewport } from '@tma.js/sdk';

viewport.bindCssVars();
// Creates CSS variables like:
// --tg-viewport-height: 675px
// --tg-viewport-width: 320px
// --tg-viewport-stable-height: 675px

viewport.bindCssVars(key => `--my-prefix-${key}`);
// Creates CSS variables like:
// --my-prefix-height: 675px
// --my-prefix-width: 320px
// --my-prefix-stableHeight: 675px

viewport.isCssVarsBound(); // true
```

## Expanding

To expand the viewport, use the `expand` method.

```ts
viewport.expand();
```

## Fullscreen Mode

To enable the fullscreen mode, the method `requestFullscreen` is used:

```ts
await viewport.requestFullscreen();
viewport.isFullscreen(); // true
```

To exit the fullscreen mode, use the `exitFullscreen` method:

```ts
await viewport.exitFullscreen();
viewport.isFullscreen(); // false
```

## Safe Area Insets

The viewport component offers access to two types of insets:

- **Safe area insets**
- **Content safe area insets**

For more details on the differences between these inset types, visit the [**Viewport**](../../../../platform/viewport.md)
page.

The component provides access to these insets through the following signals:

```ts
// Objects with numeric properties "top", "bottom", "left" and "right".
viewport.safeAreaInsets();
viewport.contentSafeAreaInsets();

// Numeric values.
viewport.safeAreaInsetTop();
viewport.safeAreaInsetBottom();
viewport.safeAreaInsetLeft();
viewport.safeAreaInsetRight();
viewport.contentSafeAreaInsetTop();
viewport.contentSafeAreaInsetBottom();
viewport.contentSafeAreaInsetLeft();
viewport.contentSafeAreaInsetRight();
```