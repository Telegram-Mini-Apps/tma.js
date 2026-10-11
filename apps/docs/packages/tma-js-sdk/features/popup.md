# 💠Popup

A component responsible for the Telegram Mini Apps [popup](../../../platform/popup.md). Popups are
supported since Mini Apps v6.2.

## Checking Support

To check if popups can be used, call the `isSupported` function. It returns `true` if the SDK is
[initialized](../initializing.md) and the Telegram client supports popups.

```ts
import { popup } from '@tma.js/sdk';

popup.isSupported(); // boolean
```

## Showing

To show a popup, use the `show` method. It accepts an object with the following properties:

- `title?: string`: popup title, 0-64 characters;
- `message: string`: popup message, 1-256 characters;
- `buttons?: PopupShowButton[]`: popup buttons, 1-3 buttons. If omitted, the popup has a single
  "Close" button;
- `timeout?: number`: time in milliseconds to wait for the popup to be closed;
- `signal?: AbortSignal`: signal to stop waiting for the popup to be closed.

Each button is an object with an optional `id` (0-64 characters, empty string by default) and one
of the following sets of properties:

- `type?: 'default' | 'destructive'` and `text: string` (1-64 characters). The `destructive` type
  indicates a destructive action, e.g. "Delete". The default type is `default`;
- `type: 'ok' | 'close' | 'cancel'`: a button with a localized text.

The method returns a promise, resolved with the identifier of the pressed button, or `undefined`
if the popup was closed without pressing a button. While the popup is opened, the `isOpened`
computed value is `true`.

```ts
const promise = popup.show({
  title: 'Delete',
  message: 'Are you sure?',
  buttons: [
    { id: 'delete', type: 'destructive', text: 'Delete' },
    { type: 'cancel' },
  ],
});
popup.isOpened(); // true

const buttonId = await promise; // 'delete', '' or undefined
popup.isOpened(); // false
```

The promise is rejected with:

- `NotInitializedError` if the SDK is not initialized;
- `MethodUnsupportedError` if popups are unsupported;
- `ConcurrentCallError` if a popup is already opened;
- `InvalidArgumentsError` if the popup parameters are invalid;
- `TimeoutError` if the popup was not closed in time;
- `signal.reason` if the signal was aborted.

> [!WARNING]
> The Telegram client provides no way to close a popup. When the timeout is reached or the signal
> is aborted, the SDK stops waiting, but the popup stays on the screen.

The `safeShow` method returns `InvalidArgumentsError` and `TimeoutError` as a result instead of
throwing them:

```ts
const result = await popup.safeShow({
  message: 'Are you sure?',
  buttons: [{ id: 'yes', text: 'Yes' }, { type: 'cancel' }],
  timeout: 60_000,
});
if (result.ok) {
  console.log('Pressed button:', result.data);
} else {
  console.error('Failed to show the popup:', result.error);
}
```

## Preparing Parameters

The `preparePopupParams` function validates popup parameters and converts them to the
`web_app_open_popup` method parameters, the same way `show` does. It trims the title, the message
and button texts, and adds the "Close" button if no buttons were passed. It is useful when calling
the method directly via [@tma.js/bridge](../../tma-js-bridge.md).

```ts
import { postEvent, preparePopupParams } from '@tma.js/sdk';

const params = preparePopupParams({ message: 'Hello!' });
if (params.ok) {
  // { title: '', message: 'Hello!', buttons: [{ type: 'close', id: '' }] }
  postEvent('web_app_open_popup', params.data);
} else {
  console.error(params.error); // InvalidArgumentsError
}
```
