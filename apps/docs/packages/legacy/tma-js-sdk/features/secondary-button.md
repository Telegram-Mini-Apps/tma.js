# 💠Secondary Button

A component responsible for the Telegram Mini Apps Secondary Button.

## Checking Support

To check if the Secondary Button is supported by the current Telegram Mini Apps version, use the `isSupported` signal:

```ts
import { secondaryButton } from '@tma.js/sdk';

secondaryButton.isSupported(); // boolean
```

## Mounting

Before using this component, it is necessary to mount it to work with properly configured properties. To do so, use the
`mount` method, it will update the `isMounted` signal.

As long as the secondary button depends on some values from [Mini App](mini-app.md) and [Theme Params](theme-params.md)
components, they should be mounted first.

```ts
import { secondaryButton, miniApp, themeParams } from '@tma.js/sdk';

miniApp.mount();
themeParams.mount();
secondaryButton.mount();
secondaryButton.isMounted(); // true
```

To unmount, use the `unmount` method:

```ts
secondaryButton.unmount();
secondaryButton.isMounted(); // false
```

## Settings Properties

To update the button properties, use the `setParams` method. It accepts an object with optional properties, each
responsible for its own button trait.

In turn, calling this method updates such signals
as `bgColor`, `hasShineEffect`, `isVisible`, `isEnabled`, `isLoaderVisible`, `position`,
`state`, `textColor` and `text`.

```ts
secondaryButton.setParams({
  bgColor: '#000000',
  hasShineEffect: true,
  isEnabled: true,
  isLoaderVisible: true,
  isVisible: true,
  position: 'top',
  text: 'My text',
  textColor: '#ffffff'
});
secondaryButton.bgColor(); // '#000000'
secondaryButton.hasShineEffect(); // true
secondaryButton.isEnabled(); // true
secondaryButton.isLoaderVisible(); // true
secondaryButton.isVisible(); // true
secondaryButton.position(); // 'top'
secondaryButton.text(); // 'My text'
secondaryButton.textColor(); // '#ffffff'

secondaryButton.state();
// {
//   bgColor: '#000000',
//   hasShineEffect: true,
//   isActive: true,
//   isLoaderVisible: true,
//   isVisible: true,
//   position: 'top',
//   text: 'My text',
//   textColor: '#ffffff'
// }
```

## Tracking Click

To add a button click listener, use the `onClick` method. It returns a function to remove the bound listener.
Alternatively, you can use the `offClick` method.

```ts
function listener() {
  console.log('Clicked!');
}

const offClick = secondaryButton.onClick(listener);
offClick();
// or
secondaryButton.onClick(listener);
secondaryButton.offClick(listener);
```
