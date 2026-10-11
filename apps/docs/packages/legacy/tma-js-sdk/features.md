---
outline: [ 2, 3 ]
---

# Features

This package is designed to give developers full control over its lifecycle, including the
initialization process. Therefore, there are no pre-initialized features available for use;
developers must configure them themselves.

By *feature*, we refer to a collection of related functionality grouped into a single entity, or a collection itself.
Examples of features include `backButton` and `mainButton`. This design makes the SDK more intuitive and efficient to
use.

It's important to note that features are provided in the following forms:

💠**Components**. They are exported as variables and usually represent a stateful object. The simplest examples are
`backButton`, `mainButton` and `hapticFeedback`.

⚙️**Utilities**. They are exported as a set of functions. These features are abstract and not grouped
into a single variable. Examples include `openLink`, `shareURL`, etc.

## Usage Prerequisites

Each feature has at least two requirements:

1. **The SDK must be [initialized](./initializing.md)**. This ensures that you are using valid global dependencies.

```ts
import { init } from '@tma.js/sdk';

init();
```

2. **The method must be run inside Telegram Mini Apps**. Calling the method outside Telegram Mini Apps will not produce
   the expected behavior.

For component-related methods, there is an additional requirement:

3. **The parent component must be mounted**. This ensures that you are using a properly configured component.

```ts
import { init, backButton } from '@tma.js/sdk';

// Initialize the SDK.
init();

// Mount the Back Button component.
backButton.mount();
```

When all requirements are met, the method call becomes safe.

### Functions Availability

To check if a function is safe to call (available), use the `isAvailable()` signal:

```ts
import { backButton } from '@tma.js/sdk';

if (backButton.show.isAvailable()) {
  backButton.show();
}
```

This signal performs all checks described in the [Usage Prerequisites](#usage-prerequisites) section
and returns `true` if the current state satisfies them.

As an alternative, you may find the `ifAvailable(...args)` method useful. It calls the original
function with the provided arguments only if it is available (`isAvailable()` returns `true`):

```ts
import { backButton } from '@tma.js/sdk';

backButton.show.ifAvailable();
```

In case the original function (`backButton.show` in this case) is unavailable, the `ifAvailable`
method call will return one of the objects:

- `{ ok: true; data: *result* }` if the function was available 
- `{ ok: false }` if the function was unavailable
