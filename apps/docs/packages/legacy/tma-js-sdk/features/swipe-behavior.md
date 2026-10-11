# 💠Swipe Behavior

A component responsible for the Telegram Mini Apps swipe behavior.

## Checking Support

To check if the swipe behavior supported by the current Telegram Mini Apps version, the `isSupported` signal is used:

```ts
import { swipeBehavior } from '@tma.js/sdk';

swipeBehavior.isSupported(); // boolean
```

## Mounting

Before using the component, it is necessary to mount it to work with properly configured properties. To do so, use the
`mount` method. It will update the `isMounted` signal.

```ts
import { swipeBehavior } from '@tma.js/sdk';

swipeBehavior.mount();
swipeBehavior.isMounted(); // true
```

To unmount, use the `unmount` method:

```ts
swipeBehavior.unmount();
swipeBehavior.isMounted(); // false
```

## Controlling Vertical Swipes

To enable or disable vertical swipes, use the `enableVertical` and `disableVertical` methods. Calling these methods,
update the `isVerticalEnabled` signal.

```ts
swipeBehavior.enableVertical();
swipeBehavior.isVerticalEnabled(); // true

swipeBehavior.disableVertical();
swipeBehavior.isVerticalEnabled(); // false
```