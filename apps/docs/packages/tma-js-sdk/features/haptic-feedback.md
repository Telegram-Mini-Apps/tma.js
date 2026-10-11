# 💠Haptic Feedback

A component responsible for the Telegram Mini
Apps [haptic feedback](../../../platform/haptic-feedback.md). Haptic feedback is supported since
Mini Apps v6.1.

## Checking Support

To check if haptic feedback can be used, call the `isSupported` function. It returns `true` if
the SDK is [initialized](../initializing.md) and the Telegram client supports haptic feedback.

```ts
import { hapticFeedback } from '@tma.js/sdk';

hapticFeedback.isSupported(); // boolean
```

All methods of the component throw `NotInitializedError` if the SDK is not initialized, and
`MethodUnsupportedError` if haptic feedback is unsupported. The component doesn't need to be
mounted.

## Impact Occurred

`impactOccurred` signals that an impact occurred. The Telegram client may play the appropriate
haptic feedback based on the passed style.

```ts
hapticFeedback.impactOccurred('medium');
```

The available styles are:

- `light`: a collision between small or lightweight UI objects.
- `medium`: a collision between medium-sized or medium-weight UI objects.
- `heavy`: a collision between large or heavyweight UI objects.
- `rigid`: a collision between hard or inflexible UI objects.
- `soft`: a collision between soft or flexible UI objects.

## Notification Occurred

`notificationOccurred` signals that a task or action succeeded, failed, or produced a warning.
The Telegram client may play the appropriate haptic feedback based on the passed type.

```ts
hapticFeedback.notificationOccurred('success');
```

The available types are:

- `error`: a task or action failed.
- `success`: a task or action completed successfully.
- `warning`: a task or action produced a warning.

## Selection Changed

`selectionChanged` signals that the user changed a selection. The Telegram client may play the
appropriate haptic feedback.

Use it only when the selection changes, not when a selection is made or confirmed.

```ts
hapticFeedback.selectionChanged();
```
