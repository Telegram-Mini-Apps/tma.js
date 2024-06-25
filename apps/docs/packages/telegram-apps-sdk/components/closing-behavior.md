# `ClosingBehavior`

Implements Telegram Mini
Apps [closing behavior](../../../platform/closing-behavior.md) functionality.

## Initialization

To initialize the component, use the `initClosingBehavior` function:

```typescript
import { initClosingBehavior } from '@telegram-apps/sdk';

const [closingBehavior] = initClosingBehavior();  
```

## Closing Confirmation

To enable and disable closing confirmation, it is required to use `enableConfirmation()`
and `disableConfirmation()` methods. These methods update `isConfirmationNeeded` property:

```typescript  
closingBehaviour.enableConfirmation();
console.log(closingBehaviour.isConfirmationNeeded); // true  

closingBehaviour.disableConfirmation();
console.log(closingBehaviour.isConfirmationNeeded); // false
```

## Events

List of events, which could be [tracked](../components#events):

| Event                         | Listener                   | Triggered when                          |
|-------------------------------|----------------------------|-----------------------------------------|
| `change`                      | `() => void`               | Something in component changed          |
| `change:isConfirmationNeeded` | `(value: boolean) => void` | `isConfirmationNeeded` property changed |