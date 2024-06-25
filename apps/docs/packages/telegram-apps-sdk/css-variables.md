# CSS Variables

This package provides utilities to help developers automate component CSS variables management.
Similar to the Telegram SDK, `@telegram-apps/sdk` allows developers to set global CSS variables connected
to specific components.

## `bindViewportCSSVars`

The `bindViewportCSSVars` function accepts a [Viewport](components/viewport.md) instance and creates
variables for the following properties: `height`, `width`, and `stableHeight`.

```ts
import { bindViewportCSSVars, initViewport } from '@telegram-apps/sdk';

const vp = await initViewport();

bindViewportCSSVars(vp);
```

By default, this function creates global CSS variables with the
names `--tg-viewport-height`, `--tg-viewport-width`, and `--tg-viewport-stable-height`. However, the
function allows passing a CSS variable name generator, which accepts one of the string values, each
responsible for a specific property: `width`, `height`, or `stable-height`.

```ts
bindViewportCSSVars(vp, key => {
  switch (key) {
    case 'height':
      return `--viewportHeight`;
    case 'width':
      return `--viewportWidth`;
    case 'stable-height':
      return `--viewportStableHeight`;
    default:
      return `--void`;
  }
});
```

## `bindThemeParamsCSSVars`

This function accepts a [ThemeParams](components/theme-params.md) instance and creates global CSS
variables related to the theme parameters.

```ts
import { bindThemeParamsCSSVars, initThemeParams } from '@telegram-apps/sdk';

const tp = initThemeParams();

bindThemeParamsCSSVars(tp);
```

By default, this function converts ThemeParams instance properties from camel case to kebab case and
adds the prefix `--tg-theme-`. Here is an example of the created variables:

- `--tg-theme-bg-color`
- `--tg-theme-secondary-bg-color`
- `--tg-theme-accent-text-color`
- etc.

Similar to the [bindViewportCSSVars](#bindViewportCSSVars) function, it allows passing a CSS
variable name generator that accepts ThemeParams instance properties.

```ts
bindThemeParamsCSSVars(tp, key => {
  // Converts camel case to kebab case.
  return `--${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}`;
});
```

## `bindMiniAppCSSVars`

The `bindMiniAppCSSVars` function accepts an instance of [MiniApp](components/mini-app.md) along
with a [ThemeParams](components/theme-params.md) instance, creating global CSS variables related to
the MiniApp instance.

```ts
import { bindMiniAppCSSVars, initMiniApp, initThemeParams } from '@telegram-apps/sdk';

const ma = initMiniApp();
const tp = initThemeParams();

bindMiniAppCSSVars(ma, tp);
```

By default, it creates variables such as `--tg-bg-color` and `--tg-header-color`. However, like all
other CSS variable binding functions, it allows customizing generated names. The passed generator
accepts one of the keys: `bg` and `header`, expecting it to return a complete CSS variable name.

```ts
bindMiniAppCSSVars(ma, tp, key => {
  switch (key) {
    case 'bg':
      return `--miniAppBg`;
    case 'header':
      return `--miniAppHeader`;
    default:
      return `--void`;
  }
});
```