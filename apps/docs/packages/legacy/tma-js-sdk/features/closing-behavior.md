# 💠Closing Behavior

A component responsible for the Telegram Mini
Apps [closing behavior](../../../../platform/closing-behavior.md).

## Mounting

Before using this component, it is necessary to mount it to work with properly configured
properties. To do so, use the `mount` method. It will update the `isMounted` signal.

```ts
import { closingBehavior } from '@tma.js/sdk';

closingBehavior.mount();
closingBehavior.isMounted(); // true
```

To unmount, use the `unmount` method:

```ts
closingBehavior.unmount();
closingBehavior.isMounted(); // false
```

## Closing Confirmation

To change the closing confirmation behavior, use the `enableConfirmation()`
and `disableConfirmation()` methods. These methods update the `isConfirmationEnabled` signal
property value.

```ts
closingBehavior.enableConfirmation();
closingBehavior.isConfirmationEnabled(); // true

closingBehavior.disableConfirmation();
closingBehavior.isConfirmationEnabled(); // false
```