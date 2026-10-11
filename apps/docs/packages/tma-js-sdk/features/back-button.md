# 💠Back Button

A component responsible for the Telegram Mini Apps [back button](../../../platform/back-button.md).
The button is supported since Mini Apps v6.1.

## Checking Support

To check if the back button can be used, call the `isSupported` function. It returns `true` if
the SDK is [initialized](../initializing.md) and the Telegram client supports the back button.

```ts
import { backButton } from '@tma.js/sdk';

backButton.isSupported(); // boolean
```

## Mounting

Before using the component, mount it with the `mount` method. If the page was reloaded, the
component restores the state saved before the reload. The `isMounted` computed value reflects the
current mount status.

```ts
backButton.mount();
backButton.isMounted(); // true
```

`mount` throws `NotInitializedError` if the SDK is not initialized, and `MethodUnsupportedError`
if the back button is unsupported.

To unmount the component, use the `unmount` method:

```ts
backButton.unmount();
backButton.isMounted(); // false
```

## Showing and Hiding

To change the button visibility, use the `show` and `hide` methods. They update the `isVisible`
computed value.

```ts
backButton.show();
backButton.isVisible(); // true

backButton.hide();
backButton.isVisible(); // false
```

Both methods throw:

- `NotInitializedError` if the SDK is not initialized;
- `MethodUnsupportedError` if the back button is unsupported;
- `NotMountedError` if the component is not mounted.

## Tracking Clicks

To add a click listener, use the `onClick` method. It returns a function removing the listener.
Alternatively, use the `offClick` method.

```ts
function listener() {
  console.log('Clicked!');
}

const offClick = backButton.onClick(listener);
offClick();
// or
backButton.onClick(listener);
backButton.offClick(listener);
```

The second argument is an optional object with the following properties:

- `once?: boolean`: remove the listener after the first call;
- `signal?: AbortSignal`: remove the listener when the signal is aborted.

```ts
const controller = new AbortController();

backButton.onClick(listener, { once: true, signal: controller.signal });
controller.abort();
```

`onClick` and `offClick` never throw, and they don't require the component to be mounted.

## State

The component state is available via the `state` computed value. Like other computed values, it
can be subscribed to.

```ts
backButton.state(); // { isVisible: false }

const unsubscribe = backButton.isVisible.subscribe((next, prev) => {
  console.log('isVisible changed:', prev, '->', next);
});
unsubscribe();
```
