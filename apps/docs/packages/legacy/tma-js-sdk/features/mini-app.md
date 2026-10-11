# 💠Mini App

A component responsible for managing functionality within Telegram Mini Apps.

## Mounting

Before using the component, it must be mounted.

To mount the component, use the `mount` method, it will update the `isMounted` signal. But to have proper
properties' values, before mounting the `miniApp`, it is required to mount `themeParams`.

So, the final correct mount example will be the following:

```ts
import { miniApp, themeParams } from '@tma.js/sdk';

themeParams.mount();
miniApp.mount();
miniApp.isMounted(); // true
```

To unmount the component, use the `unmount` method:

```ts
miniApp.unmount();
miniApp.isMounted(); // false
```

## Binding CSS Variables

To expose the `miniApp` properties via CSS variables, use the `bindCssVars` method. The `isCssVarsBound` signal
is updated after the method is called.

This method optionally accepts a function that transforms the values `bgColor` and `headerColor`
into CSS variable names. By default, values are converted to kebab case with the prefix `--tg-`.

```ts
miniApp.bindCssVars();
// Creates CSS variables like:
// --tg-bg-color: #aabbcc
// --tg-header-color: #aabbcc

miniApp.bindCssVars(key => `--my-prefix-${key}`);
// Creates CSS variables like:
// --my-prefix-bgColor: #aabbcc
// --my-prefix-headerColor: #aabbcc

miniApp.isCssVarsBound(); // true
```

## Header Color

To change the mini application header color, the method `setHeaderColor` is used. In turn, calling this method updates
the `headerColor` signal.

The method accepts either an RGB color value or one of the following strings: `bg_color`, `secondary_bg_color`.

```ts
miniApp.setHeaderColor('bg_color');
miniApp.headerColor(); // 'bg_color'

if (miniApp.setHeaderColor.supports('rgb')) {
  miniApp.setHeaderColor('#aabbcc');
  miniApp.headerColor(); // '#aabbcc'
}
```

## Background Color

To update the mini application background color, use the `setBgColor` method. Calling this method updates the `bgColor`
signal.

```ts
miniApp.setBgColor('#ffffff');
miniApp.bgColor(); // '#ffffff'
```

## Active State

The mini application becomes inactive if it is wrapped into the bottom native Telegram client tray
or if the currently active tab of the mini apps browser is changed to another one.

To track if the mini application is currently active, use the `isActive` signal.

```ts
miniApp.isActive();
```

## Methods

### `close`

To close the mini application, use the `close` method.

```ts
miniApp.close();
```

### `ready`

To signal that the Mini App is ready to be displayed, use the `ready` method. Once called, the loading placeholder is
hidden, and the Mini App is shown.

```ts
miniApp.ready();
```

> [!TIP]
> Call this function as early as possible after loading essential interface elements to ensure a smooth user experience.