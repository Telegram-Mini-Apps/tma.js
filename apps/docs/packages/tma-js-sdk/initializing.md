# Initializing

The SDK has no side effects on import. Before using it, the package must be configured with the
`init` function. It saves launch parameters and the `postEvent` function to use across the
package. Not doing it, almost all package functions and component methods will throw
`NotInitializedError`.

```ts
import { init } from '@tma.js/sdk';

init();
```

## What `init` Does

Calling `init`:

1. Retrieves launch parameters using the `retrieveLaunchParams` function, unless they were passed
   in options. Launch parameters are used to know the Mini Apps version supported by the Telegram
   client, the platform, the initial theme, init data and other values.
2. Creates a `postEvent` function checking whether methods are supported by the current Telegram
   client, unless a custom one was passed in options.
3. In Telegram Web (when the mini app is launched in an iframe), starts handling the
   `reload_iframe` and `set_custom_style` events and notifies the Telegram client that the iframe
   is ready.

The function returns a function removing the added event listeners and styles. Calling `init`
again performs this cleanup for the previous call first.

```ts
const cleanup = init();
// ...
cleanup();
```

## Options

The function accepts an optional object with the following structure:

```ts
interface InitOptions {
  /**
   * Apply styles sent by Telegram Web clients.
   * @default true
   */
  acceptCustomStyles?: boolean;
  /**
   * Launch parameters to use.
   * @default Launch parameters retrieved with the `retrieveLaunchParams` function.
   */
  launchParams?: LaunchParams;
  /**
   * Function calling Mini Apps methods.
   * @default A function created with `createPostEvent` for the current Mini Apps version. It
   * throws `MethodUnsupportedError` and `MethodParameterUnsupportedError` on unsupported calls.
   */
  postEvent?: PostEventFn;
}
```

In most scenarios, a developer does not need to use these options.

### Launch Parameters

Pass `launchParams` to use specific launch parameters instead of the ones retrieved from the
current environment. Learn more about launch parameters in the
[@tma.js/bridge](../tma-js-bridge/launch-parameters.md) documentation.

```ts
import { init } from '@tma.js/sdk';

init({
  launchParams: {
    tgWebAppPlatform: 'tdesktop',
    tgWebAppVersion: '8.0',
    tgWebAppThemeParams: { bg_color: '#17212b' },
  },
});
```

### Custom `postEvent`

By default, the SDK uses a function created with `createPostEvent` from
[@tma.js/bridge](../tma-js-bridge/methods.md) in the strict mode. It throws
`MethodUnsupportedError` if the method is not supported by the Telegram client, and
`MethodParameterUnsupportedError` if some of the passed parameters are unsupported.

To change this behavior, pass your own function. For example, to log a warning instead of
throwing:

```ts
import { createPostEvent, init, retrieveLaunchParams } from '@tma.js/sdk';

const launchParams = retrieveLaunchParams();

init({
  launchParams,
  postEvent: createPostEvent(launchParams.tgWebAppVersion, 'non-strict'),
});
```

::: warning
The `postEvent` function passed to `init` is used only by the SDK components and functions. The
`postEvent`, `request` and `invokeCustomMethod` functions re-exported from the bridge don't use
it. If you need them to use a specific `postEvent` function, pass it in their options.
:::

## Handling Errors

If launch parameters were not passed and can't be retrieved, `init` throws
`LaunchParamsRetrieveError`. This usually happens when the app is opened outside Telegram.

To get the error as a value instead, use `safeInit`. It returns a result object:

```ts
import { safeInit } from '@tma.js/sdk';

const result = safeInit();
if (result.ok) {
  const cleanup = result.data;
} else {
  console.error('Unable to initialize the SDK', result.error);
}
```

## Checking Initialization

To check if the SDK is initialized, use the `isInitialized` function:

```ts
import { init, isInitialized } from '@tma.js/sdk';

isInitialized(); // false
init();
isInitialized(); // true
```

## Developing Outside Telegram

Outside Telegram there are no launch parameters, so `init` throws. To develop the app in a
regular browser, mock the Telegram environment with the `mockTelegramEnv` function before
calling `init`. Learn more about it in the
[@tma.js/bridge](../tma-js-bridge/environment.md) documentation.

```ts
import { init, mockTelegramEnv } from '@tma.js/sdk';

mockTelegramEnv({
  launchParams: {
    tgWebAppPlatform: 'tdesktop',
    tgWebAppVersion: '9.0',
    tgWebAppThemeParams: { bg_color: '#17212b' },
  },
});
init();
```

## Functions Not Requiring Initialization

The following functions work without calling `init`:

- functions re-exported from [@tma.js/bridge](../tma-js-bridge.md);
- `copyTextToClipboard`;
- `retrieveAndroidDeviceData` and `retrieveAndroidDeviceDataFrom`;
- `isColorDark`, `isRGB`, `toRGB` and their safe versions;
- `isTelegramHostname` and `preparePopupParams`;
- `isSupported` and `supports` methods (they return `false` before initialization);
- `onClick` and `offClick` methods of buttons;
- reading computed values and subscribing to their changes.
