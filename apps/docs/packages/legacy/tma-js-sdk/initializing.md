# Initializing

As long as the SDK uses some internal global dependencies, before using it, the package must be
configured. Not doing it, most package functions will not work at all and will throw a
corresponding error.

To initialize the SDK, the package provides the `init` function, which accepts an object
with the following structure:

```ts
interface InitOptions {
  /**
   * True if SDK should accept styles sent from
   * the Telegram client.
   * @default true
   */
  acceptCustomStyles?: boolean;
  /**
   * True if the application is launched in inline mode.
   * @default Will be calculated based on the launch
   * parameters' tgWebAppBotInline field.
   */
  isInlineMode?: boolean;
  /**
   * A custom `postEvent` function to use across the package.
   * @default tma.js/bridge's postEventFp function
   * will be used.
   */
  postEvent?: PostEventFpFn;
  /**
   * Mini application theme parameters.
   * @default Will be calculated based on the launch
   * parameters' tgWebAppThemeParams field.
   */
  themeParams?: ThemeParams;
  /**
   * Telegram Mini Apps version supported by the Telegram client.
   * @default Will be calculated based on the launch
   * parameters' tgWebAppVersion field.
   */
  version?: Version;
}
```

In most scenarios, a developer does not need to use these options.

By calling this function, the package's global dependencies will be configured, and the package becomes ready to use.

::: code-group
```ts [Throwing]
import { init } from '@tma.js/sdk';

init();
```

```ts [Functional]
import { initFp } from '@tma.js/sdk';

initFp();
```
:::