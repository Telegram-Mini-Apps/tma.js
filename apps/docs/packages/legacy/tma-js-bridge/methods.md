# Methods

This article covers topics related to [apps communication](../../../platform/apps-communication.md)
methods.

## Calling Methods

To call Telegram Mini Apps methods, developers should use the `postEvent` function:

```typescript
import { postEvent } from '@tma.js/bridge';

postEvent('web_app_setup_back_button', { is_visible: true });
```

This function automatically determines the correct way to send the event based on the current
environment. It identifies the Telegram app type and selects the appropriate flow.

## Checking Method Support

By default, the `postEvent` function does not check if the specified method is supported by the
current Telegram app. To do this, the `supports` function is used.

It accepts a Mini Apps method name and the current platform version:

```typescript
import { supports } from '@tma.js/bridge';

supports('web_app_trigger_haptic_feedback', '6.0'); // false
supports('web_app_trigger_haptic_feedback', '6.1'); // true
```

The `supports` function also allows checking if a specific parameter in the method parameters is
supported:

```typescript
import { supports } from '@tma.js/bridge';

supports('web_app_open_link', 'try_instant_view', '6.0'); // false
supports('web_app_open_link', 'try_instant_view', '6.7'); // true
```

> [!TIP]
> It is recommended to use this function before calling Mini Apps methods to prevent apps from
> stalling or encountering unexpected behavior.

## Creating Safer `postEvent`

This package includes a function named `createPostEvent` that takes the current Mini Apps version as
input.

It returns a new `postEvent` function, which internally checks if the passed method and
parameters are supported.

```typescript
import { createPostEvent } from '@tma.js/bridge';

const postEvent = createPostEvent('6.5');

// Will work fine.
postEvent('web_app_read_text_from_clipboard');

// Will throw an error, this method is not supported 
// in Mini Apps version 6.5.
postEvent('web_app_request_phone');
```

As a second optional argument, the function accepts a callback that is called if the method or
parameter is unsupported.

```ts
createPostEvent('6.0', data => {
  if ('param' in data) {
    console.warn(
      'Oops, the parameter', data.param,
      'in method', data.method,
      'is not supported',
    );
  } else {
    console.warn('Oops, method', data.method, 'is not supported');
  }
});
```

Despite the fact, that it is not recommended, to log warnings instead of throwing errors,
the `'non-strict'` value can be passed:

```ts
const postEvent = createPostEvent('6.5', 'non-strict');

// Will work fine.
postEvent('web_app_read_text_from_clipboard');

// Will show a warning in the console, stating that specified
// method is unsupported in version 6.5. Nothing else will happen.
postEvent('web_app_request_phone');
```

## Functional Approach

```typescript
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { postEventFp, retrieveLaunchParamsFp } from '@tma.js/bridge';

pipe(postEventFp('web_app_expand'), E.match(
  error => {
    // error will be typed here, you will know exactly what is wrong.
  },
  () => {
    // Everything is ok.
  },
));
```

-> [Learn more about functional approach](functional-approach.md)