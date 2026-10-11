# 💠Main Button

A component responsible for the Telegram Mini Apps [main button](../../../../platform/main-button.md).

## Mounting

Before using this component, it is necessary to mount it to work with properly configured
properties. To do so, use the `mount` method. It will update the `isMounted` signal.

```ts
import { mainButton } from '@tma.js/sdk';

mainButton.mount();
mainButton.isMounted(); // true
```

To unmount, use the `unmount` method:

```ts
mainButton.unmount();
mainButton.isMounted(); // false
```

> [!WARNING]
> This component's properties depend on values from the [Theme Params](theme-params.md) component.
> Make sure to mount Theme Params before using the Main Button.

## Settings Properties

To update the button properties, use the `setParams` method. It accepts an object with optional properties, each
responsible for its own button trait.

In turn, calling this method updates such signals as `bgColor`, `hasShineEffect`, `isVisible`, `isEnabled`,
`isLoaderVisible`, `state`, `textColor` and `text`.

```ts
mainButton.setParams({
  bgColor: '#000000',
  hasShineEffect: true,
  isEnabled: true,
  isLoaderVisible: true,
  isVisible: true,
  text: 'My text',
  textColor: '#ffffff'
});
mainButton.bgColor(); // '#000000'
mainButton.hasShineEffect(); // true
mainButton.isEnabled(); // true
mainButton.isLoaderVisible(); // true
mainButton.isVisible(); // true
mainButton.text(); // 'My text'
mainButton.textColor(); // '#ffffff'

mainButton.state();
// {
//   bgColor: '#000000',
//   hasShineEffect: true,
//   isActive: true,
//   isLoaderVisible: true,
//   isVisible: true,
//   text: 'My text',
//   textColor: '#ffffff'
// }
```

## Tracking Click

To add a button click listener, use the `onClick` method. It returns a function to remove the bound
listener. Alternatively, you can use the `offClick` method.

```ts
function listener() {
  console.log('Clicked!');
}

const offClick = mainButton.onClick(listener);
offClick();
// or
mainButton.onClick(listener);
mainButton.offClick(listener);
```
