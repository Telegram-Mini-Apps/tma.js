# Advanced

This article covers advanced usage of the bridge.

## Calling Method, Receiving Event

The `request` function should be used when a developer needs to call a Telegram Mini Apps method and
receive a specific event.

For example, to call
the [web_app_request_viewport](../../../platform/methods.md#web-app-request-viewport) method and catch
the [viewport_changed](../../../platform/events.md#viewport-changed) event for actual viewport data:

```typescript
import { request } from '@tma.js/bridge';

await request('web_app_request_viewport', 'viewport_changed');
// {
//   is_state_stable: true,
//   is_expanded: false,
//   height: 320
// };
```

If the Telegram Mini Apps method accepts parameters, they should be passed in the `params` property
of the third argument:

```typescript
const { button_id } = await request('web_app_open_popup', 'popup_closed', {
  params: {
    title: 'Caution',
    message: 'Should we delete your account?',
    buttons: [
      { id: 'yes', type: 'ok' },
      { id: 'no', type: 'cancel' },
    ],
  },
});
```

It is also allowed to track several events at the same time:

```typescript
await request(
  'web_app_open_scan_qr_popup',
  ['qr_text_received', 'scan_qr_popup_closed'],
);

// The result will either be the qr_text_received 
// or scan_qr_popup_closed event payload.
```

This function allows passing additional options such as `postEvent`, `abortSignal`, `timeout`,
and `capture`.

### `postEvent`

The `postEvent` option allows a developer to override the method used to call the Telegram Mini Apps
method.

```typescript
request('web_app_request_viewport', 'viewport_changed', {
  postEvent() {
    console.log('Hey, I am not going to do anything. Live with that');
  },
});
```

### `abortSignal`

To abort the returned promise externally, the `abortSignal` option is used.

```ts
const controller = new AbortController();

request('web_app_request_viewport', 'viewport_changed', {
  abortSignal: controller.signal,
});

setTimeout(() => {
  controller.abort(new Error('Not going to wait anymore'));
}, 500);
```

### `timeout`

The `timeout` option assigns a timeout to the request.

```typescript
import { request } from '@tma.js/bridge';

try {
  await request(
    'web_app_invoke_custom_method',
    'custom_method_invoked',
    {
      timeout: 5000,
      params: {
        req_id: '1',
        method: 'deleteStorageValues',
        params: { keys: ['a'] },
      },
    },
  );
} catch (e) {
  console.error(e); // e.name will be 'TimeoutError'
}
```

#### `capture`

The `capture` property is a function that allows developers to determine if an occurred Mini Apps
event should be captured and returned from the `request` function:

```typescript
const slug = 'jjKSJnm1k23lodd';

request('web_app_open_invoice', 'invoice_closed', {
  params: { slug },
  capture(data) {
    return slug === data.slug;
  },
});
```

By default, the `request` function captures the first event with the required name. In this case,
the function will capture the event only if it has the expected slug, specific for the
[invoice_closed](../../../platform/events.md#invoice-closed) event.

When passing an array of events, the `capture` function will receive an object with
the `event: EventName` and `payload?: EventPayload` properties.

### Functional Approach

This function supports a [functional alternative](functional-approach.md) - `requestFp`:

```typescript
import { requestFp } from '@tma.js/bridge';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

pipe(
  requestFp('web_app_request_viewport', 'viewport_changed'),
  TE.match(
    error => {
      // Something went wrong.
    },
    viewport => {
      // Data was received.
    }
  )
);
```

## Invoking Custom Methods

Custom methods are those methods which can be used with
the [web_app_invoke_custom_method](../../../platform/methods.md#web-app-invoke-custom-method) Mini
Apps
method.

The `invokeCustomMethod` function simplifies the usage of such methods by reusing the `request`
function.

Here’s an example without using this function:

```typescript
const reqId = 'ABC';

request('web_app_invoke_custom_method', 'custom_method_invoked', {
  params: {
    req_id: reqId,
    method: 'deleteStorageValues',
    params: { keys: ['a'] },
  },
  capture(data) {
    return data.req_id === reqId;
  }
})
  .then(({ data, error }) => {
    if (error) {
      throw new Error(error);
    }
    return data;
  })
  .then(data => {
    console.log('We got some data', data);
  });
```

Now, rewritten using the `invokeCustomMethod` function:

```typescript
import { invokeCustomMethod } from '@tma.js/bridge';

invokeCustomMethod('deleteStorageValues', { keys: ['a'] }, 'ABC')
  .then(data => {
    console.log('We got some data', data);
  });
```

Internally, it just encapsulates a specific logic related to the methods, so a developer shouldn't
do it.

Unlike the `request` function, the `invokeCustomMethod` function parses the result and checks if it
contains the `error` property. If it does, the function throws the corresponding error; otherwise,
the `result` property is returned.

### Functional Approach

This function supports a [functional alternative](functional-approach.md) - `invokeCustomMethodFp`:

```typescript
import { invokeCustomMethodFp } from '@tma.js/bridge';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

pipe(
  invokeCustomMethodFp('deleteStorageValues', { keys: ['a'] }, 'ABC'),
  TE.match(
    error => {
      // Something went wrong.
    },
    response => {
      // Method was executed.
    }
  )
);
```