# 💠Closing Behavior

A component responsible for the Telegram Mini
Apps [closing behavior](../../../platform/closing-behavior.md).

## Checking Support

To check if the component can be used, call the `isSupported` function. The closing behavior is
supported by all Telegram clients, so the function returns `true` if the SDK is
[initialized](../initializing.md).

```ts
import { closingBehavior } from '@tma.js/sdk';

closingBehavior.isSupported(); // boolean
```

## Mounting

Before using the component, mount it with the `mount` method. If the page was reloaded, the
component restores the state saved before the reload. The `isMounted` computed value reflects the
current mount status.

```ts
closingBehavior.mount();
closingBehavior.isMounted(); // true
```

`mount` throws `NotInitializedError` if the SDK is not initialized.

To unmount the component, use the `unmount` method:

```ts
closingBehavior.unmount();
closingBehavior.isMounted(); // false
```

## Closing Confirmation

To change the closing confirmation behavior, use the `enableConfirmation` and
`disableConfirmation` methods. They update the `isConfirmationEnabled` computed value.

```ts
closingBehavior.enableConfirmation();
closingBehavior.isConfirmationEnabled(); // true

closingBehavior.disableConfirmation();
closingBehavior.isConfirmationEnabled(); // false
```

Both methods throw `NotInitializedError` if the SDK is not initialized, and `NotMountedError` if
the component is not mounted.

## State

The component state is available via the `state` computed value.

```ts
closingBehavior.state(); // { isConfirmationEnabled: false }

const unsubscribe = closingBehavior.isConfirmationEnabled.subscribe((next, prev) => {
  console.log('Confirmation:', prev, '->', next);
});
unsubscribe();
```
