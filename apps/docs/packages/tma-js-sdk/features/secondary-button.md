# 💠Secondary Button

A component responsible for the Telegram Mini Apps secondary button, displayed at the bottom of
the mini app along with the [main button](main-button.md). The button is supported since Mini Apps
v7.10.

## Checking Support

To check if the secondary button can be used, call the `isSupported` function. It returns `true`
if the SDK is [initialized](../initializing.md) and the Telegram client supports the secondary
button.

```ts
import { secondaryButton } from '@tma.js/sdk';

secondaryButton.isSupported(); // boolean
```

## Mounting

Before using the component, mount it with the `mount` method. If the page was reloaded, the
component restores the state saved before the reload. The `isMounted` computed value reflects the
current mount status.

```ts
secondaryButton.mount();
secondaryButton.isMounted(); // true
```

`mount` throws `NotInitializedError` if the SDK is not initialized, and `MethodUnsupportedError`
if the secondary button is unsupported.

To unmount the component, use the `unmount` method:

```ts
secondaryButton.unmount();
secondaryButton.isMounted(); // false
```

> [!WARNING]
> Default button colors are taken from the [Mini App](mini-app.md) and
> [Theme Params](theme-params.md) components. Mount them before using the secondary button:
>
> ```ts
> import { miniApp, secondaryButton } from '@tma.js/sdk';
>
> // Mounts themeParams too.
> miniApp.mount();
> secondaryButton.mount();
> ```

## Setting Properties

To update several button properties at once, use the `setParams` method. It accepts an object
with optional properties, each responsible for its own button trait. Properties with `undefined`
values are ignored.

```ts
secondaryButton.setParams({
  bgColor: '#000000',
  hasShineEffect: true,
  iconCustomEmojiId: '5368324170671202286',
  isEnabled: true,
  isLoaderVisible: true,
  isVisible: true,
  position: 'top',
  text: 'Cancel',
  textColor: '#ffffff',
});
```

The `position` property sets the button position relative to the main button: `left`, `right`,
`top` or `bottom`.

The component also provides a method for each property:

| Method                                        | Description                                         |
|-----------------------------------------------|-----------------------------------------------------|
| `show()`, `hide()`                            | Shows or hides the button.                          |
| `enable()`, `disable()`                       | Enables or disables the button.                     |
| `showLoader()`, `hideLoader()`                | Shows or hides the loading indicator.               |
| `enableShineEffect()`, `disableShineEffect()` | Enables or disables the shine effect.               |
| `setText(text)`                               | Sets the button text.                               |
| `setBgColor(color)`                           | Sets the background color in the `#RRGGBB` format.  |
| `setTextColor(color)`                         | Sets the text color in the `#RRGGBB` format.        |
| `setIconCustomEmojiId(id)`                    | Sets the custom emoji displayed alongside the text. Since Mini Apps v9.5. |
| `setPosition(position)`                       | Sets the position relative to the main button.      |

```ts
secondaryButton.setText('Cancel');
secondaryButton.setPosition('left');
secondaryButton.show();
```

If nothing has changed, the methods don't call the Telegram client.

All these methods throw:

- `NotInitializedError` if the SDK is not initialized;
- `MethodUnsupportedError` if the secondary button is unsupported;
- `MethodParameterUnsupportedError` if the passed parameter is unsupported by the Telegram
  client. Currently, it happens only to `iconCustomEmojiId` before Mini Apps v9.5;
- `NotMountedError` if the component is not mounted.

### Checking Parameters Support

Some button parameters were released later than the button itself. To check if they are
supported, use `setParams.supports`, or the `isSupported` function of the corresponding method:

```ts
secondaryButton.setParams.isSupported(); // the same as secondaryButton.isSupported()
secondaryButton.setParams.supports('hasShineEffect'); // true since Mini Apps v7.10
secondaryButton.setParams.supports('iconCustomEmojiId'); // true since Mini Apps v9.5

secondaryButton.enableShineEffect.isSupported(); // true since Mini Apps v7.10
secondaryButton.disableShineEffect.isSupported(); // true since Mini Apps v7.10
secondaryButton.setIconCustomEmojiId.isSupported(); // true since Mini Apps v9.5
```

## Reading Properties

Each property is available as a computed value:

```ts
secondaryButton.bgColor(); // RGB
secondaryButton.textColor(); // RGB
secondaryButton.hasShineEffect(); // boolean
secondaryButton.iconCustomEmojiId(); // string | undefined
secondaryButton.isEnabled(); // boolean
secondaryButton.isLoaderVisible(); // boolean
secondaryButton.isVisible(); // boolean
secondaryButton.position(); // 'left' | 'right' | 'top' | 'bottom'
secondaryButton.text(); // string
```

`bgColor` and `textColor` return the color set by the developer, or the default one if it was not
set:

- `bgColor` defaults to the mini app bottom bar color (`miniApp.bottomBarColorRgb()`), then to
  the theme `secondary_bg_color`, then to `#ffffff`;
- `textColor` defaults to the theme `button_color`, then to `#2481cc`.

## Tracking Clicks

To add a click listener, use the `onClick` method. It returns a function removing the listener.
Alternatively, use the `offClick` method.

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

The second argument is an optional object with the following properties:

- `once?: boolean`: remove the listener after the first call;
- `signal?: AbortSignal`: remove the listener when the signal is aborted.

`onClick` and `offClick` never throw, and they don't require the component to be mounted.

## State

The component state is available via the `state` computed value. Unlike `bgColor` and `textColor`
computed values, the state contains only the colors set by the developer.

```ts
secondaryButton.state();
// {
//   hasShineEffect: false,
//   isEnabled: true,
//   isLoaderVisible: false,
//   isVisible: false,
//   position: 'left',
//   text: 'Cancel',
// }

const unsubscribe = secondaryButton.isVisible.subscribe((next, prev) => {
  console.log('isVisible changed:', prev, '->', next);
});
unsubscribe();
```
