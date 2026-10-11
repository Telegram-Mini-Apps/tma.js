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

For example, if your main library is React, you should install `@tma.js/sdk-react` instead
of `@tma.js/sdk`.

Here is the command to install the package:

::: code-group

```bash [pnpm]
pnpm i @tma.js/sdk-react
```

```bash [npm]
npm i @tma.js/sdk-react
```

```bash [yarn]
yarn add @tma.js/sdk-react
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

The SDK provides a list of components that might seem ready to use once imported, but this is only
partially true.

It’s important to understand that the SDK does not have any side effects. To avoid various issues,
it doesn’t perform operations automatically upon import. Instead, you need to initialize it
manually.

By default, the SDK is uninitialized and not ready for use. All components remain unmounted. To
initialize the SDK and unlock not only the components’ `mount` method but also other
non-component-related methods, you **must** use the `init` function.

```ts
import { init } from '@tma.js/sdk';

init();
```

After calling this, it is now safe to mount any components you wish to use in your application.

## Mount Used Components

In the previous section, we initialized the SDK, allowing us to use components.

Before using specific components in your application, you must mount them. Not mounting components
will cause their methods to throw errors. For example, the following code will cause issues:

```ts
import { init, backButton } from '@tma.js/sdk';

// Initialize the SDK.
init();

// Attempt to show the Back Button.
backButton.show();
// Error: The backButton component was not mounted.
```

To avoid this issue, mount the component before using its methods:

```ts
import { init, backButton } from '@tma.js/sdk';

// Initialize the SDK.
init();

// Mount the Back Button.
backButton.mount();

// Show the Back Button.
backButton.show();
```

> [!TIP]
> The mount-checking mechanism ensures that you are working with a properly initialized component.

## Always Check Availability

Not all Telegram Mini Apps methods were implemented in a single release. Some may have been
implemented years ago, while others were introduced only recently.

Because there are many users with different versions of the native Telegram application, you must
check if a method is available on their device before using it:

```ts
import { backButton } from '@tma.js/sdk';

// ... the SDK is already initialized, and the Back Button is mounted.
if (backButton.show.isAvailable()) {
  backButton.show();
}
```

The `isAvailable()` method verifies if the function is currently available and can be safely called.
It performs the following checks:

- The current environment is Telegram Mini Apps
- The SDK is initialized
- The method is supported by the current Telegram Mini Apps version
- The parent component is mounted

Not using this signal and simply calling the method may lead to errors related to one of the above
checks.

If you don’t want to perform this check every time and the result of the method execution is not
crucial, use the `ifAvailable(...args)` method. This method accepts the same parameters as the
original function:

```ts
import { backButton } from '@tma.js/sdk';

// ... the SDK is already initialized, and the Back Button is mounted.
backButton.show.ifAvailable();
```