# `ThemeParams`

The component which contains an information about currently
used [theme](../../../platform/theming.md) by the Telegram application.

## Initialization

To initialize the component, use the `initThemeParams` function:

```typescript
import { initThemeParams } from '@telegram-apps/sdk';

const [themeParams] = initThemeParams();  
```

## Requesting Actual Data

To get the actual theme parameters information, developer could use the `requestThemeParams`
function:

```typescript
import { requestThemeParams } from '@telegram-apps/sdk';

requestThemeParams.then(console.log);

// Output:
// { bgColor: '#ffaabb', ... }
```

## Colors

The developer can retrieve the theme color by using the `get` method:

```typescript
themeParams.get('bgColor');
themeParams.get('packageUnknownColor');
```

To retrieve all colors via one object, use `getState` method:

```typescript
themeParams.getState();
// Output:
// {
//   accentTextColor: '#aa1399',
//   bgColor: '#baac12',
//   linkColor: '#887722'
//   packageUnknownColor: '#676767,
// }
```

The `ThemeParams` component provides direct access to the list of colors:

- `accentTextColor: RGB | undefined`
- `bgColor: RGB | undefined`
- `buttonColor: RGB | undefined`
- `buttonTextColor: RGB | undefined`
- `destructiveTextColor: RGB | undefined`
- `headerBgColor: RGB | undefined`
- `hintColor: RGB | undefined`
- `linkColor: RGB | undefined`
- `secondaryBgColor: RGB | undefined`
- `sectionBgColor: RGB | undefined`
- `sectionHeaderTextColor: RGB | undefined`
- `subtitleTextColor: RGB | undefined`
- `textColor: RGB | undefined`

Example:

```typescript
themeParams.accentTextColor; // '#aa1399'
```

## Events

List of events, which could be [tracked](../components#events):

| Event                | Listener               | Triggered when                   |
|----------------------|------------------------|----------------------------------|
| `change`             | `() => void`           | Something in component changed   |
| `change:{theme_key}` | `(value: RGB) => void` | Color with specified key changed |