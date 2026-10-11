# 💠Haptic Feedback

A component responsible for the Telegram Mini
Apps [haptic feedback](../../../../platform/haptic-feedback.md).

## Checking Support

To check if the haptic feedback is supported by the current Telegram Mini Apps version, the `isSupported` signal is used:

```ts
import { hapticFeedback } from '@tma.js/sdk';

hapticFeedback.isSupported(); // boolean
```

## Impact Occurred

`impactOccurred` is the method that signals an impact event. The Telegram app may play the
appropriate haptic feedback based on the style value passed.

```ts
hapticFeedback.impactOccurred('medium');
```

The available styles for the impact haptic event are:

- `light`: indicates a collision between small or lightweight UI objects.
- `medium`: indicates a collision between medium-sized or medium-weight UI objects.
- `heavy`: indicates a collision between large or heavyweight UI objects.
- `rigid`: indicates a collision between hard or inflexible UI objects.
- `soft`: indicates a collision between soft or flexible UI objects.

## Notification Occurred

`notificationOccurred` is the method that signals a task or action has succeeded, failed, or
triggered a warning. The Telegram app may play the appropriate haptic feedback based on the type
value passed.

```ts
hapticFeedback.notificationOccurred('success');
```

The types of notification events are:

- `error`: indicates that a task or action has failed.
- `success`: indicates that a task or action has been completed successfully.
- `warning`: indicates that a task or action has triggered a warning.

## Selection Changed

`selectionChanged` is the method that signals a user has changed a selection. The Telegram app may
play the appropriate haptic feedback.

Use this feedback only when the selection changes, not when a selection is made or confirmed.

```ts
hapticFeedback.selectionChanged();
```
