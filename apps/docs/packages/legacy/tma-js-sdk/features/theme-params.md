# 💠Theme Params

A component responsible for the Telegram Mini Apps [theme parameters](../../../../platform/theming.md).

## Mounting

Before using the component, it must be mounted.

To mount the component, use the `mount` method. It will update the `isMounted` signal.

```ts
import { themeParams } from '@tma.js/sdk';

themeParams.mount();
themeParams.isMounted(); // true
```

To unmount, use the `unmount` method:

```ts
themeParams.unmount();
themeParams.isMounted(); // false
```

## Binding CSS Variables

This component allows its properties to be exposed via CSS variables.

To create new CSS variables, use the `bindCssVars` method. When called, it updates the `isCssVarsBound` signal.

This method optionally accepts a function that receives a theme palette key in camel case format and
returns a CSS variable name. By default, the method transforms the palette key using these rules:

- Converts the value to kebab case.
- Prepends the `--tg-theme-` prefix.

```ts
themeParams.bindCssVars();
// Creates CSS variables like:
// --tg-theme-button-color: #aabbcc
// --tg-theme-accent-text-color: #aabbcc
// --tg-theme-bg-color: #aabbcc
// ...

themeParams.bindCssVars(key => `--my-prefix-${key}`);
// Creates CSS variables like:
// --my-prefix-buttonColor: #aabbcc
// --my-prefix-accentTextColor: #aabbcc
// --my-prefix-bgColor: #aabbcc
// ...

// themeParams.isCssVarsBound() -> true
```

## Properties

```ts
themeParams.accentTextColor(); // RGB | undefined
themeParams.bgColor(); // RGB | undefined
themeParams.buttonTextColor(); // RGB | undefined
themeParams.buttonColor(); // RGB | undefined
themeParams.destructiveTextColor(); // RGB | undefined
themeParams.headerBgColor(); // RGB | undefined
themeParams.hintColor(); // RGB | undefined
themeParams.linkColor(); // RGB | undefined
themeParams.subtitleTextColor(); // RGB | undefined
themeParams.sectionBgColor(); // RGB | undefined
themeParams.secondaryBgColor(); // RGB | undefined
themeParams.sectionSeparatorColor(); // RGB | undefined
themeParams.sectionHeaderTextColor(); // RGB | undefined
themeParams.textColor(); // RGB | undefined

themeParams.state(); // Record<string, RGB>;
```