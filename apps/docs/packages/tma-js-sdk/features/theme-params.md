# 💠Theme Params

A component responsible for the Telegram Mini Apps [theme parameters](../../../platform/theming.md).
Theme parameters are available in every Telegram client, so the component has no `isSupported`
function.

## Mounting

Before using the component, mount it with the `mount` method. It takes the theme from the launch
parameters, or restores the state saved before the page reload, and starts listening to theme
changes. The `isMounted` computed value reflects the current mount status.

```ts
import { themeParams } from '@tma.js/sdk';

themeParams.mount();
themeParams.isMounted(); // true
```

`mount` throws `NotInitializedError` if the SDK is not initialized.

> [!TIP]
> Mounting the [Mini App](mini-app.md) component also mounts Theme Params.

While mounted, the component listens to the `theme_changed` event. The received theme replaces the
current one entirely.

To unmount the component, use the `unmount` method. The component stops listening to theme
changes.

```ts
themeParams.unmount();
themeParams.isMounted(); // false
```

## Colors

Each known theme color is available as a computed value. If the Telegram client didn't pass the
color, the value is `undefined`.

```ts
themeParams.accentTextColor(); // RGB | undefined
themeParams.bgColor(); // RGB | undefined
themeParams.bottomBarBgColor(); // RGB | undefined
themeParams.buttonColor(); // RGB | undefined
themeParams.buttonTextColor(); // RGB | undefined
themeParams.destructiveTextColor(); // RGB | undefined
themeParams.headerBgColor(); // RGB | undefined
themeParams.hintColor(); // RGB | undefined
themeParams.linkColor(); // RGB | undefined
themeParams.secondaryBgColor(); // RGB | undefined
themeParams.sectionBgColor(); // RGB | undefined
themeParams.sectionHeaderTextColor(); // RGB | undefined
themeParams.sectionSeparatorColor(); // RGB | undefined
themeParams.subtitleTextColor(); // RGB | undefined
themeParams.textColor(); // RGB | undefined

const unsubscribe = themeParams.bgColor.subscribe((next, prev) => {
  console.log('Background color changed:', prev, '->', next);
});
unsubscribe();
```

To check if the theme is dark, use the `isDark` computed value. It is `true` if the background
color (`bg_color`) is dark, and `false` if it is light or missing.

```ts
themeParams.isDark(); // boolean
```

## State

The whole theme is available via the `state` computed value. Its keys are snake-cased color names
as the Telegram client passes them, including keys unknown to the SDK. Values are colors in the
`#RRGGBB` format.

```ts
themeParams.state();
// {
//   bg_color: '#17212b',
//   button_color: '#5288c1',
//   text_color: '#f5f5f5',
//   ...
// }
```

## Binding CSS Variables

To expose the theme via CSS variables, use the `bindCssVars` method. The variables are updated
whenever the theme changes. The `isCssVarsBound` computed value reflects whether the variables are
bound.

By default, the variables are named `--tg-theme-{key}`, where `{key}` is a theme parameters key in
kebab case.

```ts
themeParams.bindCssVars();
// Creates CSS variables like:
// --tg-theme-bg-color: #17212b
// --tg-theme-button-color: #5288c1
// --tg-theme-accent-text-color: #6ab2f2
// ...

themeParams.isCssVarsBound(); // true
```

The method optionally accepts a function receiving a theme parameters key as it is in the state,
i.e. in snake case, and returning a CSS variable name. If the function returns a falsy value, the
variable is not created.

```ts
themeParams.bindCssVars(key => {
  // Skip the section colors.
  return key.startsWith('section_') ? null : `--my-theme-${key.replace(/_/g, '-')}`;
});
// Creates CSS variables like:
// --my-theme-bg-color: #17212b
// --my-theme-button-color: #5288c1
// ...
```

`bindCssVars` returns a function removing the created variables:

```ts
const unbind = themeParams.bindCssVars();
unbind();
themeParams.isCssVarsBound(); // false
```

`bindCssVars` throws:

- `NotMountedError` if the component is not mounted;
- `CSSVarsBoundError` if the variables are already bound.
