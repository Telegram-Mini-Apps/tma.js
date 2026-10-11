# @tma.js/sdk-solid

Solid bindings for [@tma.js/sdk](../sdk). The package re-exports the SDK, so it is the only
package to install.

```bash
pnpm i @tma.js/sdk-solid
```

## Components state

Reactive values of SDK components, like `backButton.isVisible` or `mainButton.state`, are
computed values. Use `useComputed` to get an accessor updated whenever such a value changes:

```tsx
import { backButton, mainButton, useComputed } from '@tma.js/sdk-solid';

function Status() {
  const isVisible = useComputed(backButton.isVisible);
  const mainButtonState = useComputed(mainButton.state);
  return (
    <>
      <p>Back button is {isVisible() ? 'visible' : 'hidden'}</p>
      <p>Main button text: {mainButtonState().text}</p>
    </>
  );
}
```

Inside a reactive owner, e.g. a component, the subscription is removed when the owner is
disposed.
