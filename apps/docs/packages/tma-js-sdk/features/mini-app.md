# 💠Mini App

A component responsible for the mini app itself: its header, background and bottom bar colors, its
activity state, and the `ready` and `close` lifecycle methods.

## Checking Support

To check if the mini app colors can be changed, call the `isSupported` function. It returns `true`
if the SDK is [initialized](../initializing.md) and the Telegram client supports changing any of
the mini app colors, i.e. since Mini Apps v6.1.

```ts
import { miniApp } from '@tma.js/sdk';

miniApp.isSupported(); // boolean
```

Each color setter also has its own `isSupported` function, as the colors were released in
different Mini Apps versions:

```ts
miniApp.setBgColor.isSupported(); // true since Mini Apps v6.1
miniApp.setHeaderColor.isSupported(); // true since Mini Apps v6.1
miniApp.setBottomBarColor.isSupported(); // true since Mini Apps v7.10
```

## Mounting

Before using the colors, mount the component with the `mount` method. If the page was reloaded,
the component restores the state saved before the reload. The `isMounted` computed value reflects
the current mount status.

```ts
miniApp.mount();
miniApp.isMounted(); // true
```

As the colors may refer to theme parameters, `mount` also mounts the
[Theme Params](theme-params.md) component if it is not mounted yet. `mount` throws
`NotInitializedError` if the SDK is not initialized.

While mounted, the component tracks the mini app activity and sends the colors following the theme
to the Telegram client whenever the theme changes.

To unmount the component, use the `unmount` method. It doesn't unmount Theme Params.

```ts
miniApp.unmount();
miniApp.isMounted(); // false
```

## Colors

The component manages three colors: background, header and bottom bar. Each of them can be set to:

- a color in any format supported by [toRGB](uncategorized.md#torgb): `#RGB`, `#RGBA`,
  `#RRGGBB`, `#RRGGBBAA`, `rgb(r, g, b)` or `rgba(r, g, b, a)`. The alpha channel is dropped;
- a [theme parameters](theme-params.md) key, e.g. `bg_color` or `secondary_bg_color`. In this
  case, the color follows the theme: when the theme changes, the new color is sent to the Telegram
  client.

### Setting Colors

To change the colors, use the `setBgColor`, `setHeaderColor` and `setBottomBarColor` methods.

```ts
miniApp.setBgColor('#ffffff');
miniApp.setHeaderColor('secondary_bg_color');
miniApp.setBottomBarColor('rgb(23, 33, 43)');
```

The header color keys `bg_color` and `secondary_bg_color` are passed to the Telegram client as is.
Other values are sent as colors in the `#RRGGBB` format. Passing an RGB header color is supported
since Mini Apps v6.9. Use `setHeaderColor.supports('rgb')` to check it:

```ts
if (miniApp.setHeaderColor.supports('rgb')) {
  miniApp.setHeaderColor('#aabbcc');
} else {
  miniApp.setHeaderColor('bg_color');
}
```

The setters throw:

- `NotInitializedError` if the SDK is not initialized;
- `MethodUnsupportedError` if the method is unsupported;
- `MethodParameterUnsupportedError` if the color format is unsupported, i.e. an RGB header color
  before Mini Apps v6.9;
- `NotMountedError` if the component is not mounted;
- `UnknownThemeParamsKeyError` if the value is neither a valid color nor a key of a color
  present in the current theme. The `data.key` property contains the passed value.

The `safeSetBgColor`, `safeSetHeaderColor` and `safeSetBottomBarColor` methods return
`UnknownThemeParamsKeyError` as a result instead of throwing it. Other errors are still thrown.

```ts
const result = miniApp.safeSetHeaderColor('section_bg_color');
if (!result.ok) {
  console.error('The theme has no such color:', result.error.data.key);
}
```

The safe methods have the same `isSupported` and `supports` functions as the throwing ones.

### Reading Colors

Each color is available in two forms: as it was set, and in the `#RRGGBB` format.

```ts
miniApp.setHeaderColor('bg_color');

miniApp.headerColor(); // 'bg_color'
miniApp.headerColorRgb(); // '#17212b'

miniApp.bgColor(); // AnyColor
miniApp.bgColorRgb(); // RGB | undefined
miniApp.bottomBarColor(); // AnyColor
miniApp.bottomBarColorRgb(); // RGB | undefined
```

The `*Rgb` computed values are `undefined` if the color is unknown, e.g. it refers to a theme key
missing in the current theme.

By default, the background and header colors are `bg_color`, and the bottom bar color is
`bottom_bar_bg_color`. Like in the official SDK, if the theme has no `bottom_bar_bg_color`, the
bottom bar color falls back to `secondary_bg_color`.

To check if the background color is dark, use the `isDark` computed value. It is `false` if the
background color is unknown.

```ts
miniApp.isDark(); // boolean
```

## Binding CSS Variables

To expose the colors via CSS variables, use the `bindCssVars` method. The variables contain colors
in the `#RRGGBB` format and are updated whenever the colors change. The `isCssVarsBound` computed
value reflects whether the variables are bound.

```ts
miniApp.bindCssVars();
// Creates CSS variables like:
// --tg-bg-color: #17212b
// --tg-bottom-bar-color: #232e3c
// --tg-header-color: #17212b

miniApp.isCssVarsBound(); // true
```

The method optionally accepts a function receiving a color key (`bgColor`, `bottomBarColor` or
`headerColor`) and returning a CSS variable name. If the function returns a falsy value, the
variable is not created.

```ts
miniApp.bindCssVars(key => key === 'bottomBarColor' ? null : `--my-prefix-${key}`);
// Creates CSS variables like:
// --my-prefix-bgColor: #17212b
// --my-prefix-headerColor: #17212b
```

`bindCssVars` returns a function removing the created variables. It throws `NotMountedError` if
the component is not mounted, and `CSSVarsBoundError` if the variables are already bound.

## Active State

The mini app becomes inactive if it is minimized into the bottom native Telegram client tray, or
if another tab of the mini apps browser becomes active. To track if the mini app is currently
active, use the `isActive` computed value. It is `true` initially and is updated only while the
component is mounted. The value changes since Mini Apps v8.0.

```ts
miniApp.isActive(); // boolean

miniApp.isActive.subscribe(isActive => {
  console.log(isActive ? 'Active' : 'Inactive');
});
```

## State

The component state is available via the `state` computed value.

```ts
miniApp.state();
// {
//   bgColor: 'bg_color',
//   bottomBarColor: 'bottom_bar_bg_color',
//   headerColor: 'bg_color',
//   isActive: true,
// }
```

## Methods

The `ready` and `close` methods don't require the component to be mounted. They throw
`NotInitializedError` if the SDK is not initialized.

### `ready`

To notify the Telegram client that the mini app is ready to be displayed, use the `ready` method.
Once called, the loading placeholder is hidden, and the mini app is shown.

```ts
miniApp.ready();
```

> [!TIP]
> Call this method as early as possible after loading essential interface elements to ensure a
> smooth user experience.

### `close`

To close the mini app, use the `close` method.

```ts
miniApp.close();
```

The method accepts an optional `returnBack` argument. If it is `true`, and the mini app was opened
from an inline button, the user is returned to the chat the mini app was opened from. This
behavior is supported since Mini Apps v7.6. Use `close.supports('returnBack')` to check it. Older
clients ignore the argument.

```ts
miniApp.close.isSupported(); // true if the SDK is initialized

if (miniApp.close.supports('returnBack')) {
  miniApp.close(true);
}
```
