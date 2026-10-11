# Advanced

This article covers advanced usage of the bridge.

## Calling Method, Receiving Event

The `request` function should be used when a developer needs to call a Telegram Mini Apps method
and receive a specific event.

For example, to call
the [web_app_request_viewport](../../platform/methods.md#web-app-request-viewport) method and catch
the [viewport_changed](../../platform/events.md#viewport-changed) event for actual viewport data:

```ts
import { request } from '@tma.js/bridge';

await request('web_app_request_viewport', 'viewport_changed');
// {
//   is_state_stable: true,
//   is_expanded: false,
//   height: 320,
//   width: 480,
// }
```

If the Telegram Mini Apps method accepts parameters, pass them in the `params` property of the
third argument. The option is required only if the method requires parameters.

```ts
import { request } from '@tma.js/bridge';

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

Event listeners are added before the method is called, so events emitted synchronously (for
example, by [mockTelegramEnv](environment.md#mocking-environment)) are captured too.

### Tracking Several Events

It is also allowed to track several events at the same time. In this case, the function returns
an object with the captured `event` name and its `payload`:

```ts
import { request } from '@tma.js/bridge';

const result = await request(
  'web_app_request_fullscreen',
  ['fullscreen_changed', 'fullscreen_failed'],
);

if (result.event === 'fullscreen_failed') {
  console.error('Unable to enter fullscreen:', result.payload.error);
} else {
  console.log('Fullscreen:', result.payload.is_fullscreen);
}
```

### Options

Along with `params`, the function accepts the `timeout`, `signal`, `capture` and `postEvent`
options.

#### `timeout`

Time in milliseconds to wait for the event. When reached, the request fails with `TimeoutError`.
By default, the request waits forever.

```ts
import { request, TimeoutError } from '@tma.js/bridge';

try {
  await request('web_app_request_phone', 'phone_requested', { timeout: 5000 });
} catch (e) {
  if (TimeoutError.is(e)) {
    console.error(`No response in ${e.data.timeout}ms`);
  }
}
```

#### `signal`

To abort the request externally, use the `signal` option. When the signal is aborted, the
returned promise is rejected with `signal.reason`, as other abortable APIs do.

```ts
import { request } from '@tma.js/bridge';

const controller = new AbortController();

request('web_app_request_viewport', 'viewport_changed', {
  signal: controller.signal,
});

setTimeout(() => {
  controller.abort(new Error('Not going to wait anymore'));
}, 500);
```

#### `capture`

A function determining if the occurred event should be captured and returned from the `request`
function. By default, the function captures the first event with the required name.

```ts
import { request } from '@tma.js/bridge';

const slug = 'jjKSJnm1k23lodd';

await request('web_app_open_invoice', 'invoice_closed', {
  params: { slug },
  capture(data) {
    return slug === data.slug;
  },
});
```

In this example, the function captures the event only if it has the expected slug, specific for
the [invoice_closed](../../platform/events.md#invoice-closed) event.

When tracking several events, the `capture` function receives an object with the `event` and
`payload` properties, the same as the function result.

If the `capture` function throws, the request is rejected with the thrown error.

For methods accepting the `req_id` parameter, the package provides the `createRequestId` function
generating a unique identifier, and the `captureSameReq` function creating a `capture` function
matching the event with the same `req_id`:

```ts
import { captureSameReq, createRequestId, request } from '@tma.js/bridge';

const reqId = createRequestId();
const { data } = await request(
  'web_app_read_text_from_clipboard',
  'clipboard_text_received',
  {
    params: { req_id: reqId },
    capture: captureSameReq(reqId),
  },
);
```

#### `postEvent`

The `postEvent` option allows a developer to override the function used to call the Telegram Mini
Apps method. For example, to check if the method is supported first, pass a function created with
[createPostEvent](methods.md#creating-safer-postevent):

```ts
import { createPostEvent, request } from '@tma.js/bridge';

await request('web_app_request_phone', 'phone_requested', {
  postEvent: createPostEvent('6.5'),
});
// Rejected with MethodUnsupportedError.
```

If `postEvent` throws, the request is rejected with the thrown error.

### Safe Version

The `safeRequest` function works the same way, but instead of throwing `TimeoutError`, it returns
the error:

```ts
import { safeRequest } from '@tma.js/bridge';

const result = await safeRequest('web_app_request_phone', 'phone_requested', {
  timeout: 5000,
});

if (result.ok) {
  console.log('Status:', result.data.status);
} else {
  console.error(`No response in ${result.error.data.timeout}ms`);
}
```

Learn more in the [Handling Errors](errors.md) article.

## Invoking Custom Methods

Custom methods are those methods which can be used with
the [web_app_invoke_custom_method](../../platform/methods.md#web-app-invoke-custom-method) Mini
Apps method.

The `invokeCustomMethod` function simplifies the usage of such methods by reusing the `request`
function.

Here's an example without using this function:

```ts
import { captureSameReq, createRequestId, request } from '@tma.js/bridge';

const reqId = createRequestId();
const { result, error } = await request(
  'web_app_invoke_custom_method',
  'custom_method_invoked',
  {
    params: {
      req_id: reqId,
      method: 'deleteStorageValues',
      params: { keys: ['a'] },
    },
    capture: captureSameReq(reqId),
  },
);
if (error) {
  throw new Error(error);
}
console.log('We got some data', result);
```

Now, rewritten using the `invokeCustomMethod` function:

```ts
import { invokeCustomMethod } from '@tma.js/bridge';

const result = await invokeCustomMethod('deleteStorageValues', { keys: ['a'] });
console.log('We got some data', result);
```

Unlike the `request` function, `invokeCustomMethod` checks if the response contains the `error`
property. If it does, the function throws `InvokeCustomMethodFailedError` with the error text in
its `data.error` property. Otherwise, the `result` property is returned.

The third argument accepts the same `timeout`, `signal` and `postEvent` options as `request`, and
the `requestId` option. The request identifier is generated automatically if omitted.

```ts
import { invokeCustomMethod } from '@tma.js/bridge';

await invokeCustomMethod('getStorageKeys', {}, {
  timeout: 5000,
  requestId: 'my-request-id',
});
```

### Safe Version

The `safeInvokeCustomMethod` function returns `InvokeCustomMethodFailedError` and `TimeoutError`
instead of throwing them:

```ts
import { matchError, safeInvokeCustomMethod } from '@tma.js/bridge';

const result = await safeInvokeCustomMethod('getStorageKeys', {}, { timeout: 5000 });
if (result.ok) {
  console.log('Keys:', result.data);
} else {
  matchError(result.error, {
    InvokeCustomMethodFailedError: e => console.error('Method failed:', e.data.error),
    TimeoutError: () => console.error('No response from Telegram'),
  });
}
```
