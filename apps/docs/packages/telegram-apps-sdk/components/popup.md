# `Popup`

Implements Telegram Mini Apps [popup](../../../platform/popup.md).

## Initialization

To initialize the component, use the `initPopup` function:

```typescript
import { initPopup } from '@telegram-apps/sdk';

const [popup] = initPopup();  
```

## Opening New Popup

To open a popup, it is required to call the `open` method specifying popup properties: title,
message, and a list of up to 3 buttons.

```typescript
popup
  .open({
    title: 'Hello!',
    message: 'Here is a test message.',
    buttons: [{ id: 'my-id', type: 'default', text: 'Default text' }],
  })
  .then(buttonId => {
    console.log(
      buttonId === null 
        ? 'User did not click any button'
        : `User clicked a button with ID "${buttonId}"`
    );
  });

console.log(popup.isOpened); // true
```

This method returns a promise, which will be fulfilled with the clicked button identifier. In the
case where the user didn't click any button, the method will return `null`.

## Events

List of events, which could be [tracked](../components#events):

| Event              | Listener                   | Triggered when                 |
|--------------------|----------------------------|--------------------------------|
| `changed`          | `() => void`               | Something in component changed |
| `changed:isOpened` | `(value: boolean) => void` | `isOpened` property changed    |

## Methods Support

List of methods, which could be used in [support checks](../components#methods-support): `open`
