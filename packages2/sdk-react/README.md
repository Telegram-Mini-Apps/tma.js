# @tma.js/sdk-react

React bindings for [@tma.js/sdk](../sdk). The package re-exports the SDK, so it is the only
package to install.

```bash
pnpm i @tma.js/sdk-react
```

## Components state

Reactive values of SDK components, like `backButton.isVisible` or `mainButton.state`, are
computed values. Use `useComputed` to re-render a React component whenever such a value changes:

```tsx
import { backButton, mainButton, useComputed } from '@tma.js/sdk-react';

function BackButtonStatus() {
  const isVisible = useComputed(backButton.isVisible);
  return <p>Back button is {isVisible ? 'visible' : 'hidden'}</p>;
}

function MainButtonText() {
  const { text } = useComputed(mainButton.state);
  return <p>Main button text: {text}</p>;
}
```

`useComputed` is based on `useSyncExternalStore`. Pass the second argument to provide the value
used during server rendering and hydration.

## Launch parameters

The following hooks compute their value once per component:

- `useLaunchParams` returns launch parameters.
- `useRawLaunchParams` returns launch parameters in the raw format.
- `useRawInitData` returns init data in the raw format.
- `useAndroidDeviceData` and `useAndroidDeviceDataFrom` return Android device data from the user
  agent.
