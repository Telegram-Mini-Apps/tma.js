# Usage Tips

## Installing the SDK

Before installing the package, it is important to understand what specifically must be installed.
This depends on the technologies you are planning to use.

If your core library is one of the following, you should install a package specific to your main
library instead of `@tma.js/sdk`:

- React: [@tma.js/sdk-react](../tma-js-sdk-react.md)
- Vue: [@tma.js/sdk-vue](../tma-js-sdk-vue.md)
- Svelte: [@tma.js/sdk-svelte](../tma-js-sdk-svelte.md)
- Solid: [@tma.js/sdk-solid](../tma-js-sdk-solid.md)

These packages re-export everything from `@tma.js/sdk` and add the `useComputed` function
connecting the SDK [computed values](./features.md#computed-values) to the framework reactivity.

For example, if your main library is React, install `@tma.js/sdk-react` together with `@tma.js/sdk`,
which is its peer dependency, and import everything from `@tma.js/sdk-react`:

::: code-group

```bash [pnpm]
pnpm i @tma.js/sdk @tma.js/sdk-react
```

```bash [npm]
npm i @tma.js/sdk @tma.js/sdk-react
```

```bash [yarn]
yarn add @tma.js/sdk @tma.js/sdk-react
```

:::

If your main library is not on the list specified above or if you prefer a pure TypeScript solution,
install the `@tma.js/sdk` package:

::: code-group

```bash [pnpm]
pnpm i @tma.js/sdk
```

```bash [npm]
npm i @tma.js/sdk
```

```bash [yarn]
yarn add @tma.js/sdk
```

:::

> [!DANGER] Avoid installing both packages
> Installing both `@tma.js/sdk` and `@tma.js/sdk-react` (for example) may lead to bugs
> due to SDK package duplication, resulting in incorrect application behavior.

## Initialize the SDK

The SDK provides a list of components and functions that might seem ready to use once imported,
but this is only partially true.

The SDK does not have any side effects. To avoid various issues, it doesn't perform operations
automatically upon import. Instead, you need to initialize it manually with the
[`init`](./initializing.md) function. Until then, almost all functions and component methods
throw `NotInitializedError`.

```ts
import { init } from '@tma.js/sdk';

init();
```

To develop the app outside Telegram, mock the environment with `mockTelegramEnv` before calling
`init`. Learn more in the [Initializing](./initializing.md#developing-outside-telegram) section.

## Check Support

Not all Telegram Mini Apps methods were implemented in a single release. Some may have been
implemented years ago, while others were introduced only recently.

Because there are many users with different versions of the native Telegram application, check if
a component or a function is supported before using it. Calling an unsupported method throws
`MethodUnsupportedError`.

```ts
import { backButton, shareStory } from '@tma.js/sdk';

if (backButton.isSupported()) {
  // ...
}

if (shareStory.isSupported()) {
  shareStory('https://example.com/background.png');
}
```

The `isSupported` method returns `true` if the SDK is initialized and the Telegram client supports
the component or the function. It doesn't check if the component is mounted.

Some methods were released later than their component, so they have their own `isSupported`
method. Methods and functions with parameters released later than themselves also have the
`supports` method accepting the feature name:

```ts
import { miniApp } from '@tma.js/sdk';

if (miniApp.setBottomBarColor.isSupported()) {
  miniApp.setBottomBarColor('#aabbcc');
}

if (miniApp.setHeaderColor.supports('rgb')) {
  miniApp.setHeaderColor('#aabbcc');
} else {
  miniApp.setHeaderColor('bg_color');
}
```

Learn more in the [Features](./features.md#checking-support) section.

## Mount Used Components

Before using stateful components in your application, you must mount them. Calling methods
changing the state of an unmounted component throws `NotMountedError`:

```ts
import { init, backButton } from '@tma.js/sdk';

// Initialize the SDK.
init();

// Attempt to show the Back Button.
backButton.show();
// NotMountedError: The "backButton" component is not mounted. Call its mount method first
```

To avoid this issue, mount the component before using its methods:

```ts
import { init, backButton } from '@tma.js/sdk';

// Initialize the SDK.
init();

if (backButton.isSupported()) {
  // Mount the Back Button.
  backButton.mount();

  // Show the Back Button.
  backButton.show();
}
```

Mounting restores the component state saved before the page reload, so the SDK knows the actual
state of the Telegram client UI after reloads.

Some components retrieve their state from the Telegram client, so their `mount` method is
asynchronous:

```ts
import { viewport } from '@tma.js/sdk';

await viewport.mount();
viewport.bindCssVars();
```

## Track Changes

Reactive values of components, like `backButton.isVisible` or `themeParams.bgColor`, are
[computed values](./features.md#computed-values). Call one to get the current value, or subscribe
to its changes:

```ts
import { themeParams } from '@tma.js/sdk';

themeParams.bgColor(); // '#17212b'

const unsubscribe = themeParams.bgColor.subscribe((next, prev) => {
  console.log('Background color changed:', prev, '->', next);
});
```

## Handle Errors

Functions and methods failing with expected errors, like a timeout or the user's refusal, have
a version with the `safe` prefix. It returns a result object instead of throwing:

```ts
import { popup } from '@tma.js/sdk';

const result = await popup.safeShow({ message: 'Are you sure?', timeout: 60_000 });
if (result.ok) {
  console.log('Pressed button:', result.data);
} else {
  console.error(result.error);
}
```

Errors meaning that the SDK is used incorrectly, like `NotInitializedError`, `NotMountedError` or
`MethodUnsupportedError`, are always thrown. Learn more in the
[Features](./features.md#handling-errors) section.
