# 💠Settings Button

A component responsible for the Telegram Mini Apps [settings button](../../../../platform/settings-button.md).

## Checking Support

To check if the settings button supported by the current Telegram Mini Apps version, the `isSupported` signal is used:

```ts
import { settingsButton } from '@tma.js/sdk';

settingsButton.isSupported(); // boolean
```

## Mounting

Before using the component, it is necessary to mount it to work with properly configured properties. To do so, use the
`mount` method. It will update the `isMounted` signal.

```ts
import { settingsButton } from '@tma.js/sdk';

settingsButton.mount();
settingsButton.isMounted(); // true
```

To unmount, use the `unmount` method:

```ts
settingsButton.unmount();
settingsButton.isMounted(); // false
```

## Showing and Hiding

To change the button's visibility, use the `hide()` and `show()` methods. These methods update the `isVisible` signal.

```ts
settingsButton.show();
settingsButton.isVisible(); // true

settingsButton.hide();
settingsButton.isVisible(); // false
```

## Tracking Click

To add a button click listener, use the `onClick` method. It returns a function to remove the bound listener.
Alternatively, you can use the `offClick` method.

```ts
function listener() {
  console.log('Clicked!');
}

const offClick = settingsButton.onClick(listener);
offClick();
// or
settingsButton.onClick(listener);
settingsButton.offClick(listener);
```
