# 💠Serverless

A component allowing a Mini App hosted on [Telegram Serverless](https://corefork.telegram.org/bots/serverless)
to call the endpoints of the bot's Serverless project.

The platform validates the Mini App init data before running an endpoint, so the endpoint is able
to identify the caller. That's why the component works only when the app is launched from
Telegram.

## Calling Endpoints

To call an endpoint, use the `call` method. It accepts the endpoint name, an optional
JSON-serializable object passed to the endpoint as its first argument, and optional call options.
The method resolves with the value returned by the endpoint.

```ts
import { serverless } from '@tma.js/sdk';

interface Profile {
  id: number;
  name: string;
}

const profile = await serverless.call<Profile>('getProfile', { lang: 'en' });
```

To abort the request, pass the `abortSignal` option:

```ts
const controller = new AbortController();
const profile = await serverless.call('getProfile', {}, {
  abortSignal: controller.signal,
});
```

## Handling Errors

If the call fails, the method rejects with `ServerlessError`. Its `data` property contains
the following fields:

- `status: number` — the HTTP status code of the response, or `0` if the request could not be
  completed.
- `type?: string` — `ENDPOINT_ERROR` if the endpoint refused the call by throwing
  an `EndpointError`.
- `parameters?: unknown` — additional data passed by the endpoint along with its `EndpointError`.

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

If init data is unavailable, the method rejects with `InvalidEnvError`. If the passed input is
not an object, it rejects with `InvalidArgumentsError`.
