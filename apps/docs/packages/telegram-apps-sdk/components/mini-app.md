---
outline: [2, 3]
---

# `MiniApp`

The component which provides the common Telegram Mini Apps functionality not covered by other system
components.

## Initialization

To initialize the component, use the `initMiniApp` function:

```typescript
import { initMiniApp } from '@telegram-apps/sdk';

const [miniApp] = initMiniApp();  
```

## Colors

### Header

Developer is able to get and update Mini App header and background colors. To get current value
of header color, developer could refer to the `headerColor` property and update it via
`setHeaderColor` method:

```typescript
miniApp.setHeaderColor('secondary_bg_color');
// or starting from v6.10:
miniApp.setHeaderColor('#aa1132');
```

### Background

As well as Mini App header color, developer is also able to manipulate its background color:

```typescript
miniApp.setBgColor('#888311');
```

Mini App background color is used to determine if current Mini App has dark palette. To know
if current palette is dark, developer should use `isDark` property:

```typescript
console.log(miniApp.isDark); // false
```

## Access Requests

Starting from Telegram Mini Apps version 6.9, Mini Apps are allowed to request access to the phone
number and request access to write the current user. To do so, developers are allowed to use
the `requestPhoneAccess` and `requestWriteAccess` methods:

```typescript
miniApp.requestPhoneAccess().then(() => {
  // done.
});

miniApp.requestWriteAccess().then(() => {
  // done.
});
```

To request the contact information (the phone number, for example), utilize the `requestContact`
method:

```typescript
miniApp.requestContact().then(contact => {
  console.log(contact);
  // Output:
  // {
  //   authDate: Date(...),
  //   hash: '...',
  //   contact: {
  //     firstName: '...',
  //     phoneNumber: '+38291789233',
  //   },
  // };
});
```

## Inline Mode

Mini Apps are available to be launched in [inline mode](https://core.telegram.org/bots/inline). When
a Mini App is launched in such a mode, the developer is allowed to use the `switchInlineQuery`
method:

```typescript
miniApp.switchInlineQuery('Show me something', ['users', 'groups']);
```

When calling this method, the Telegram application sends the bot username and the specified text to
the chat selected by the user. The list of available chats will be restricted by the chat types
specified in the second argument.

To check if the current Mini App is launched in inline mode, the developer should refer to
the `isBotInline` property:

```typescript
console.log(miniApp.isBotInline); // false
```

## Lifecycle Methods

### `ready`

Informs the Telegram app that the Mini App is ready to be displayed.

It is recommended to call this method as early as possible, as soon as all essential interface
elements loaded. Once this method called, the loading placeholder is hidden and the Mini App shown.

If the method not called, the placeholder will be hidden only when the page fully loaded.

```typescript
miniApp.ready();
```

### `close`

Closes the Mini App.

```typescript
miniApp.close();
```

## Other Methods

### `sendData`

A method used to send data to the bot. When this method is called, a service message is sent to the
bot containing data of a length up to 4096 bytes, and the Mini App is closed. Refer to
the `web_app_data` field in the [Message](https://core.telegram.org/bots/api#message) class.

## Events

List of events, which could be [tracked](../components#events):

| Event                | Listener                                 | Triggered when                 |
|----------------------|------------------------------------------|--------------------------------|
| `change`             | `() => void`                             | Something in component changed |
| `change:bgColor`     | `(value: RGB) => void`                   | `bgColor` property changed     |
| `change:headerColor` | `(value: HeaderColorKey or RGB) => void` | `headerColor` property changed |

## Methods Support

List of methods and parameters, which could be used
in [support checks](../components#methods-support): `requestWriteAccess`, `requestPhoneAccess`, 
`switchInlineQuery`, `setHeaderColor`, `setBgColor` and `setHeaderColor.color`.
