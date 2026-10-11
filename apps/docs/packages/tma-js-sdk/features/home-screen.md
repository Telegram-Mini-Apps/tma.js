# ⚙️Home Screen

Functions allowing the mini app to be added to the device home screen. They are supported since
Mini Apps v8.0.

All functions have the `isSupported` method returning `true` if the SDK is
[initialized](../initializing.md) and the Telegram client supports the function. They throw
`NotInitializedError` if the SDK is not initialized, and `MethodUnsupportedError` if the function
is unsupported.

## `addToHomeScreen`

To ask the user to add the mini app to the home screen, use the `addToHomeScreen` function.

```ts
import { addToHomeScreen } from '@tma.js/sdk';

if (addToHomeScreen.isSupported()) {
  addToHomeScreen();
}
```

The function doesn't wait for the user response. To track whether the mini app was added, listen
to the `home_screen_added` and `home_screen_failed` events with the `onEvent` and `offEvent`
functions:

```ts
import { onEvent, offEvent } from '@tma.js/sdk';

function onAdded() {
  console.log('Added');
}

onEvent('home_screen_added', onAdded);
offEvent('home_screen_added', onAdded);

// onEvent returns a function removing the listener.
const off = onEvent('home_screen_failed', () => {
  console.log('User declined the request');
});
off();
```

::: info
If the device can't determine the installation status, the event may not be received even if
the icon was added.
:::

## `checkHomeScreenStatus`

To check if the mini app is already added to the home screen, use the `checkHomeScreenStatus`
function. It returns one of the following statuses:

- `unsupported`: the feature is not supported, and it is not possible to add the icon;
- `unknown`: the feature is supported, but the status can't be determined;
- `added`: the icon was already added;
- `missed`: the icon was not added yet.

```ts
import { checkHomeScreenStatus } from '@tma.js/sdk';

const status = await checkHomeScreenStatus();
```

The function accepts an optional object with the `timeout` and `signal` properties. It throws
`TimeoutError` if the Telegram client didn't respond in time. When the signal is aborted, the
promise is rejected with `signal.reason`.

`safeCheckHomeScreenStatus` returns `TimeoutError` as a result instead of throwing it.

```ts
import { safeCheckHomeScreenStatus } from '@tma.js/sdk';

const result = await safeCheckHomeScreenStatus({ timeout: 5000 });
if (result.ok) {
  console.log(result.data);
}
```
