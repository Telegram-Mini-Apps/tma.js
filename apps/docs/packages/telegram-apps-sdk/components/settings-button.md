# `SettingsButton`

Implements Telegram Mini Apps [Settings Button](../../../platform/settings-button.md).

## Initialization

To initialize the component, use the `initSettingsButton` function:

```typescript
import { initSettingsButton } from '@telegram-apps/sdk';

const [settingsButton] = initSettingsButton();  
```

## Showing and Hiding

To show and hide the `SettingsButton`, it is required to use `show()` and `hide()` methods. These
methods update the button's `isVisible` property:

```typescript  
settingsButton.show();
console.log(settingsButton.isVisible); // true  

settingsButton.hide();
console.log(settingsButton.isVisible); // false  
```  

## Events

List of events, which could be [tracked](../components#events):

| Event              | Listener                   | Triggered when                 |
|--------------------|----------------------------|--------------------------------|
| `click`            | `() => void`               | Settings Button was clicked    |
| `change`           | `() => void`               | Something in component changed |
| `change:isVisible` | `(value: boolean) => void` | `isVisible` property changed   |

## Methods Support

List of methods, which could be used in [support checks](../components#methods-support): `show`
and `hide`