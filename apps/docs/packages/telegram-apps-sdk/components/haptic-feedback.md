# `HapticFeedback`

Implements Telegram Mini
Apps [haptic feedback](../../../platform/haptic-feedback.md) functionality.

## Initialization

To initialize the component, use the `initHapticFeedback` function:

```typescript
import { initHapticFeedback } from '@telegram-apps/sdk';

const [hapticFeedback] = initHapticFeedback();  
```

## Notifications

`HapticFeedback` supports 3 types of haptic events - `impactOccurred`, `notificationOccurred`
and `selectionChanged`.

### `impactOccurred`

A method tells that an impact occurred. The Telegram app may play the appropriate haptics based on
style value passed. Style of impact occurred haptic event:

- `light`, indicates a collision between small or lightweight UI objects
- `medium`, indicates a collision between medium-sized or medium-weight UI objects
- `heavy`, indicates a collision between large or heavyweight UI objects
- `rigid`, indicates a collision between hard or inflexible UI objects
- `soft`, indicates a collision between soft or flexible UI objects

```typescript
haptic.impactOccurred('medium');
```

### `notificationOccurred`

A method tells that a task or action has succeeded, failed, or produced a warning. The Telegram app
may play the appropriate haptics based on type value passed. Type of notification occurred type
event.

- `error`, indicates that a task or action has failed,
- `success`, indicates that a task or action has completed successfully,
- `warning`, indicates that a task or action produced a warning.

```typescript
haptic.notificationOccurred('success');
```

### `selectionChanged`

A method tells that the user has changed a selection.

```typescript
haptic.selectionChanged();
```

## Methods Support

List of methods, which could be used in [support checks](../components#methods-support):
`notificationOccurred`, `impactOccurred` and `selectionChanged`
