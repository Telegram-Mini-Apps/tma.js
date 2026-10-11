# 💠Back Button

A component responsible for the Telegram Mini Apps [back button](../../../../platform/back-button.md).

## Checking Support

To check if the back button is supported by the current Telegram Mini Apps version, use the `isSupported` signal:

```ts
import { backButton } from '@tma.js/sdk';

backButton.isSupported(); // boolean
```

## Mounting

Before using this component, it is necessary to mount it to work with properly configured
properties. To do so, use the `mount` method. It will update the `isMounted` signal.

```ts
import { backButton } from '@tma.js/sdk';

backButton.mount();
backButton.isMounted(); // true
```

To unmount, use the `unmount` method:

```ts
backButton.unmount();
backButton.isMounted(); // false
```

## Showing and Hiding

To change the button's visibility, use the `hide()` and `show()` methods. These methods update the `isVisible` signal.

```ts
backButton.show();
backButton.isVisible(); // true

backButton.hide();
backButton.isVisible(); // false
```

## Tracking Click

To add a button click listener, use the `onClick` method. It returns a function to remove the bound
listener. Alternatively, you can use the `offClick` method.

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
