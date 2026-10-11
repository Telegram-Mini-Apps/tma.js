# 💠Main Button

A component responsible for the Telegram Mini Apps [main button](../../../platform/main-button.md).
The button is supported since Mini Apps v6.0, so it is available in every Telegram client.

## Checking Support

To check if the main button can be used, call the `isSupported` function. It returns `true` if
the SDK is [initialized](../initializing.md) and the Telegram client supports the main button.

```ts
import { mainButton } from '@tma.js/sdk';

mainButton.isSupported(); // boolean
```

## Mounting

Before using the component, mount it with the `mount` method. If the page was reloaded, the
component restores the state saved before the reload. The `isMounted` computed value reflects the
current mount status.

```ts
mainButton.mount();
mainButton.isMounted(); // true
```

`mount` throws `NotInitializedError` if the SDK is not initialized, and `MethodUnsupportedError`
if the main button is unsupported.

To unmount the component, use the `unmount` method:

```ts
mainButton.unmount();
mainButton.isMounted(); // false
```

> [!WARNING]
> Default button colors are taken from the [Theme Params](theme-params.md) component. Mount it
> before using the main button, otherwise the defaults are used:
> `#2481cc` for the background and `#ffffff` for the text. Mounting [Mini App](mini-app.md) also
> mounts Theme Params.

## Setting Properties

To update several button properties at once, use the `setParams` method. It accepts an object
with optional properties, each responsible for its own button trait. Properties with `undefined`
values are ignored.

```ts
mainButton.setParams({
  bgColor: '#000000',
  hasShineEffect: true,
  iconCustomEmojiId: '5368324170671202286',
  isEnabled: true,
  isLoaderVisible: true,
  isVisible: true,
  text: 'Submit',
  textColor: '#ffffff',
});
```

The component also provides a method for each property:

| Method                       | Description                                          |
|------------------------------|------------------------------------------------------|
| `show()`, `hide()`           | Shows or hides the button.                           |
| `enable()`, `disable()`      | Enables or disables the button.                      |
| `showLoader()`, `hideLoader()` | Shows or hides the loading indicator.              |
| `enableShineEffect()`, `disableShineEffect()` | Enables or disables the shine effect. Since Mini Apps v7.10. |
| `setText(text)`              | Sets the button text.                                |
| `setBgColor(color)`          | Sets the background color in the `#RRGGBB` format.   |
| `setTextColor(color)`        | Sets the text color in the `#RRGGBB` format.         |
| `setIconCustomEmojiId(id)`   | Sets the custom emoji displayed alongside the text. Since Mini Apps v9.5. |

```ts
mainButton.setText('Submit');
mainButton.show();
mainButton.showLoader();
```

If nothing has changed, the methods don't call the Telegram client.

All these methods throw:

- `NotInitializedError` if the SDK is not initialized;
- `MethodUnsupportedError` if the main button is unsupported;
- `MethodParameterUnsupportedError` if the passed parameter is unsupported by the Telegram
  client. Currently, it happens only to `iconCustomEmojiId` before Mini Apps v9.5. Older clients
  ignore `hasShineEffect`;
- `NotMountedError` if the component is not mounted.

### Checking Parameters Support

Some button parameters were released later than the button itself. To check if they are
supported, use `setParams.supports`, or the `isSupported` function of the corresponding method:

```ts
mainButton.setParams.isSupported(); // the same as mainButton.isSupported()
mainButton.setParams.supports('hasShineEffect'); // true since Mini Apps v7.10
mainButton.setParams.supports('iconCustomEmojiId'); // true since Mini Apps v9.5

mainButton.enableShineEffect.isSupported(); // true since Mini Apps v7.10
mainButton.disableShineEffect.isSupported(); // true since Mini Apps v7.10
mainButton.setIconCustomEmojiId.isSupported(); // true since Mini Apps v9.5
```

```ts
if (mainButton.setIconCustomEmojiId.isSupported()) {
  mainButton.setIconCustomEmojiId('5368324170671202286');
}
```

## Reading Properties

Each property is available as a computed value:

```ts
mainButton.bgColor(); // RGB
mainButton.textColor(); // RGB
mainButton.hasShineEffect(); // boolean
mainButton.iconCustomEmojiId(); // string | undefined
mainButton.isEnabled(); // boolean
mainButton.isLoaderVisible(); // boolean
mainButton.isVisible(); // boolean
mainButton.text(); // string
```

`bgColor` and `textColor` return the color set by the developer, or the default one if it was not
set: the theme `button_color` and `button_text_color` respectively.

## Tracking Clicks

To add a click listener, use the `onClick` method. It returns a function removing the listener.
Alternatively, use the `offClick` method.

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

The second argument is an optional object with the following properties:

- `once?: boolean`: remove the listener after the first call;
- `signal?: AbortSignal`: remove the listener when the signal is aborted.

```ts
mainButton.onClick(listener, { once: true });
```

`onClick` and `offClick` never throw, and they don't require the component to be mounted.

## State

The component state is available via the `state` computed value. Unlike `bgColor` and `textColor`
computed values, the state contains only the colors set by the developer.

```ts
mainButton.state();
// {
//   hasShineEffect: false,
//   isEnabled: true,
//   isLoaderVisible: false,
//   isVisible: false,
//   text: 'Continue',
// }

const unsubscribe = mainButton.state.subscribe((next, prev) => {
  console.log('State changed:', prev, '->', next);
});
unsubscribe();
```
