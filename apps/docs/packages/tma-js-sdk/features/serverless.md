# 💠Serverless

A component allowing a mini app hosted on [Telegram Serverless](https://corefork.telegram.org/bots/serverless)
to call the endpoints of the bot's Serverless project.

The SDK passes the mini app init data to the endpoint in the `Authorization` header, and the
platform validates it before running the endpoint, so the endpoint is able to identify the caller.
That's why the component works only when the app is launched from Telegram.

## Calling Endpoints

To call an endpoint, use the `call` method. It accepts the endpoint name, an optional object passed
to the endpoint as its input, and optional call options. The input must be a JSON-serializable
object, `{}` by default. The method resolves with the value returned by the endpoint.

```ts
import { serverless } from '@tma.js/sdk';

interface Profile {
  id: number;
  name: string;
}

const profile = await serverless.call<Profile>('getProfile', { lang: 'en' });
```

The endpoint is called via a `POST` request to `/api/{name}`.

To abort the call, pass the `signal` option. When the signal is aborted, the promise is rejected
with `signal.reason`.

```ts
const controller = new AbortController();
const promise = serverless.call('getProfile', {}, { signal: controller.signal });
controller.abort();
```

## Handling Errors

The promise returned by `call` is rejected with:

- `NotInitializedError` if the SDK is not initialized;
- `InvalidEnvError` if the launch parameters contain no init data;
- `InvalidArgumentsError` if the input is not an object, e.g. an array or `null`;
- `ServerlessError` if the endpoint failed, returned an unexpected response, or the request could
  not be completed.

The `data` property of `ServerlessError` (`ServerlessErrorData`) contains the following fields:

- `status: number`: the HTTP status code of the response, or `0` if the request could not be
  completed, e.g. because of a network error. In this case, the original error is available in
  the `cause` property;
- `type?: string`: `ENDPOINT_ERROR` if the endpoint refused the call by throwing
  an `EndpointError`;
- `parameters?: unknown`: additional data passed by the endpoint along with its `EndpointError`.

```ts
import { serverless, ServerlessError } from '@tma.js/sdk';

try {
  await serverless.call('getProfile');
} catch (e) {
  if (ServerlessError.is(e)) {
    console.error(e.message, e.data.status, e.data.type, e.data.parameters);
  }
}
```

The `safeCall` method returns `InvalidArgumentsError` and `ServerlessError` (the
`ServerlessCallError` type) as a result instead of throwing them:

```ts
const result = await serverless.safeCall<Profile>('getProfile');
if (result.ok) {
  console.log('Profile:', result.data);
} else {
  console.error('Call failed:', result.error);
}
```
