# Events

This article covers topics related to [apps communication](../../platform/apps-communication.md)
events. The list of all available events and their payloads can be found in the
[platform documentation](../../platform/events.md).

## Listening to Events

To start listening to an event, use the `onEvent` function. It returns a function removing the
added listener.

```ts
import { onEvent } from '@tma.js/bridge';

// Start listening to the "viewport_changed" event.
const off = onEvent('viewport_changed', payload => {
  console.log('Viewport changed:', payload);
});

// Stop listening.
off();
```

Event names and payloads are typed. Listeners of events without payload receive `undefined`.

Alternatively, to stop listening to the event, use the `offEvent` function:

```ts
import { onEvent, offEvent, type EventListener } from '@tma.js/bridge';

const listener: EventListener<'viewport_changed'> = payload => {
  console.log('Viewport changed:', payload);
  offEvent('viewport_changed', listener);
};

onEvent('viewport_changed', listener);
```

Adding the same listener of the same event twice has no effect: the listener is called once per
event.

### One-Time Listener

To call the listener only once and remove it after, pass the `once` option:

```ts
import { onEvent } from '@tma.js/bridge';

onEvent('viewport_changed', payload => {
  console.log('Viewport changed:', payload);
}, { once: true });
```

### Removing Listeners With `AbortSignal`

The `signal` option removes the listener when the signal is aborted. It is handy to remove
several listeners at once:

```ts
import { onEvent } from '@tma.js/bridge';

const controller = new AbortController();

onEvent('theme_changed', console.log, { signal: controller.signal });
onEvent('viewport_changed', console.log, { signal: controller.signal });

// Removes both listeners.
controller.abort();
```

If the signal is already aborted, the listener is not added.

### Listening to All Events

To listen to all events, use the `onAnyEvent` function. The listener receives an object with the
event `name` and its `payload`, typed depending on the name. It accepts the same options as
`onEvent`.

```ts
import { onAnyEvent, offAnyEvent, type AnyEventListener } from '@tma.js/bridge';

const listener: AnyEventListener = event => {
  if (event.name === 'viewport_changed') {
    console.log('Viewport changed:', event.payload);
  }
};

const off = onAnyEvent(listener);

// Both lines remove the listener.
off();
offAnyEvent(listener);
```

### Removing All Listeners

The `offAll` function removes all event listeners added via `onEvent` and `onAnyEvent`:

```ts
import { offAll } from '@tma.js/bridge';

offAll();
```

## How Events Are Received

The package starts receiving events when the first listener is added and stops when the last one
is removed. To receive events, it defines the functions Telegram clients call
(`window.Telegram.WebView.receiveEvent`, `window.TelegramGameProxy.receiveEvent` and
`window.TelegramGameProxy_receiveEvent`) and listens to messages posted by Telegram Web clients.
The official SDK defines the same functions, so they are composed: both the official SDK and this
package receive events, regardless of which one was loaded first.

Some Telegram clients send malformed payloads, so the package fixes known issues before passing
the payload to listeners:

- `viewport_changed`: if the payload is `null` (macOS), the current window size is used, and the
  missing `width` is replaced with `window.innerWidth`;
- `popup_closed`: the payload is always an object, containing `button_id` only if a button was
  pressed;
- `theme_changed`: colors sent as numbers are converted to the `#RRGGBB` format.

If the payload of a known event is invalid, the event is not delivered, and the error is logged.

An error thrown by a listener is logged and doesn't prevent other listeners from being called.

## Emitting Events

The `emitEvent` function emits an event as if it was sent by the Telegram client. It is mostly used
to respond to method calls while [mocking the environment](environment.md#mocking-environment).

```ts
import { emitEvent } from '@tma.js/bridge';

emitEvent('theme_changed', { theme_params: { bg_color: '#17212b' } });
emitEvent('back_button_pressed');
```

The event is delivered the same way a real Telegram client delivers it, so other libraries,
including the official SDK, receive it too.
