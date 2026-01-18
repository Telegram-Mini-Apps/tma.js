# 💠Popup

A component responsible for the Telegram Mini Apps [popup](../../../platform/popup.md).

## Checking Support

To check if the popup is supported by the current Telegram Mini Apps version, the `isSupported` signal is used:

```ts
import { popup } from '@tma.js/sdk';

popup.isSupported(); // boolean
```

## Showing

To show a popup, it is required to call the `show` method specifying popup properties: title, message, and a list of up
to 3 buttons.

The method returns a promise, which will be fulfilled with the clicked button identifier. In the case where the user
didn't click any button, the method will return `null`.

Calling the method updates the `isOpened` signal.

```ts
import { popup } from '@tma.js/sdk';

// popup.isOpened() -> false
const promise = popup.show({
  title: 'Hello!',
  message: 'Here is a test message.',
  buttons: [{ id: 'my-id', type: 'default', text: 'Default text' }],
});
// popup.isOpened() -> true
const buttonId = await promise;
// popup.isOpened() -> false
```
