# 💠Swipe Behavior

A component responsible for the Telegram Mini Apps [swipe behavior](../../../platform/swipe-behavior.md).
It controls whether the user can minimize or close the mini app with a vertical swipe. The swipe
behavior is supported since Mini Apps v7.7.

## Checking Support

To check if the swipe behavior can be used, call the `isSupported` function. It returns `true` if
the SDK is [initialized](../initializing.md) and the Telegram client supports the swipe behavior.

```ts
import { swipeBehavior } from '@tma.js/sdk';

swipeBehavior.isSupported(); // boolean
```

## Mounting

Before using the component, mount it with the `mount` method. If the page was reloaded, the
component restores the state saved before the reload. The `isMounted` computed value reflects the
current mount status.

```ts
swipeBehavior.mount();
swipeBehavior.isMounted(); // true
```

`mount` throws `NotInitializedError` if the SDK is not initialized, and `MethodUnsupportedError`
if the swipe behavior is unsupported.

To unmount the component, use the `unmount` method:

```ts
swipeBehavior.unmount();
swipeBehavior.isMounted(); // false
```

## Controlling Vertical Swipes

To allow or prevent closing the mini app with a vertical swipe, use the `enableVertical` and
`disableVertical` methods. They update the `isVerticalEnabled` computed value, which is `true` by
default.

```ts
swipeBehavior.disableVertical();
swipeBehavior.isVerticalEnabled(); // false

swipeBehavior.enableVertical();
swipeBehavior.isVerticalEnabled(); // true
```

Both methods throw:

- `NotInitializedError` if the SDK is not initialized;
- `MethodUnsupportedError` if the swipe behavior is unsupported;
- `NotMountedError` if the component is not mounted.

## State

The component state is available via the `state` computed value. Like other computed values, it
can be subscribed to.

```ts
swipeBehavior.state(); // { isVerticalEnabled: true }

const unsubscribe = swipeBehavior.isVerticalEnabled.subscribe((next, prev) => {
  console.log('isVerticalEnabled changed:', prev, '->', next);
});
unsubscribe();
```
