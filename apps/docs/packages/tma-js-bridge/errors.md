# Handling Errors

This article describes how functions of the package report errors, and how to handle them.

## Throwing and Safe Functions

Functions failing with expected errors (a timeout, missing launch parameters, a too long start
parameter, etc.) come in pairs:

- the regular function (for example, `request`) returns the result or throws the error;
- the `safe` counterpart (for example, `safeRequest`) never throws expected errors, but returns
  them as a value of the `Result` type.

```ts
type Result<E, T> =
  | { ok: true; data: T }
  | { ok: false; error: E };
```

Note that the error type goes first. Unlike a thrown error, the error type here is known to the
compiler, so it is clear which errors should be handled:

```ts
import { safeRetrieveLaunchParams } from '@tma.js/bridge';

const result = safeRetrieveLaunchParams();
if (result.ok) {
  // result.data is LaunchParams.
  console.log(result.data.tgWebAppPlatform);
} else {
  // result.error is LaunchParamsRetrieveError.
  console.error(result.error.message);
}
```

Here is the list of functions having a `safe` counterpart and the errors they produce:

| Function                  | Safe counterpart              | Errors                                          |
|---------------------------|-------------------------------|-------------------------------------------------|
| `request`                 | `safeRequest`                 | `TimeoutError`                                  |
| `invokeCustomMethod`      | `safeInvokeCustomMethod`      | `InvokeCustomMethodFailedError`, `TimeoutError` |
| `parseLaunchParams`       | `safeParseLaunchParams`       | `InvalidLaunchParamsError`                      |
| `retrieveLaunchParams`    | `safeRetrieveLaunchParams`    | `LaunchParamsRetrieveError`                     |
| `retrieveRawLaunchParams` | `safeRetrieveRawLaunchParams` | `LaunchParamsRetrieveError`                     |
| `retrieveRawInitData`     | `safeRetrieveRawInitData`     | `LaunchParamsRetrieveError`                     |
| `createStartParam`        | `safeCreateStartParam`        | `StartParamTooLongError`                        |

Functions without expected errors, such as `postEvent` or `decodeStartParam`, have no `safe`
counterpart.

## Errors Always Thrown

Only expected errors are returned in `Result`. Errors related to the environment and to incorrect
usage are always thrown, even from `safe` functions:

- `UnknownEnvError` is thrown by `postEvent` (and so by `request` and `invokeCustomMethod`) when
  the app is opened outside Telegram;
- `MethodUnsupportedError` and `MethodParameterUnsupportedError` are thrown by functions created
  with [createPostEvent](methods.md#creating-safer-postevent);
- aborted requests are rejected with `signal.reason`, as other abortable APIs are;
- errors thrown by the `capture` and `postEvent` options of `request` are passed as is.

```ts
import { safeRequest, UnknownEnvError } from '@tma.js/bridge';

const controller = new AbortController();

try {
  const result = await safeRequest('web_app_request_phone', 'phone_requested', {
    timeout: 5000,
    signal: controller.signal,
  });
  if (!result.ok) {
    console.error('Timeout reached');
  }
} catch (e) {
  if (UnknownEnvError.is(e)) {
    console.error('The app was opened outside Telegram');
  } else if (e === controller.signal.reason) {
    console.error('The request was aborted');
  }
}
```

## Matching Errors

The package re-exports the `matchError` function from
[error-kid](https://npmjs.com/package/error-kid). It calls the handler matching the error name.
The compiler requires handling every error from the error type, so adding a new error to
a function makes the compilation fail until the error is handled.

```ts
import { matchError, safeInvokeCustomMethod } from '@tma.js/bridge';

const result = await safeInvokeCustomMethod('getStorageKeys', {}, { timeout: 5000 });
if (result.ok) {
  console.log('Keys:', result.data);
} else {
  matchError(result.error, {
    InvokeCustomMethodFailedError: e => console.error('Method failed:', e.data.error),
    TimeoutError: e => console.error(`No response in ${e.data.timeout}ms`),
  });
}
```

## Checking Errors

Every error class of the package has the static `is` method. Prefer it over `instanceof`: it
compares the error tag, so it works across realms and even when the package is duplicated in the
bundle.

```ts
import { retrieveLaunchParams, LaunchParamsRetrieveError } from '@tma.js/bridge';

try {
  retrieveLaunchParams();
} catch (e) {
  if (LaunchParamsRetrieveError.is(e)) {
    // e is LaunchParamsRetrieveError here.
    console.log(e.data.errors);
  }
}
```

## Errors List

| Error                             | Description                                                               | `data`                       |
|-----------------------------------|---------------------------------------------------------------------------|------------------------------|
| `UnknownEnvError`                 | No known way to communicate with the Telegram client.                     | —                            |
| `MethodUnsupportedError`          | The method is not supported in the Mini Apps version.                     | `{ method, version }`        |
| `MethodParameterUnsupportedError` | The method parameter is not supported in the Mini Apps version.           | `{ method, param, version }` |
| `LaunchParamsRetrieveError`       | Launch parameters were not found in any source.                           | `{ errors }`                 |
| `InvalidLaunchParamsError`        | The value doesn't represent valid launch parameters.                      | `{ value }`                  |
| `InvokeCustomMethodFailedError`   | The custom method returned an error.                                      | `{ error }`                  |
| `TimeoutError`                    | The operation didn't complete in time.                                    | `{ timeout }`                |
| `StartParamTooLongError`          | The encoded start parameter is longer than 512 characters.                | `{ length }`                 |

`InvalidLaunchParamsError` also has the `cause` property with the validation error.

## Result Helpers

The package exports helpers to work with `Result` values, which may be useful when writing your
own `safe` functions:

- `ok(data)` creates a successful result;
- `err(error)` creates a failed result;
- `unwrap(result)` returns the result data or throws the result error;
- `throwing(safeFn)` creates a throwing version of a function returning a `Result` (or a promise
  of it).

```ts
import { err, ok, throwing, unwrap, type Result } from '@tma.js/bridge';

class NegativeError extends Error {}

function safeSqrt(value: number): Result<NegativeError, number> {
  return value < 0 ? err(new NegativeError()) : ok(Math.sqrt(value));
}

const sqrt = throwing(safeSqrt);

sqrt(4); // 2
unwrap(safeSqrt(9)); // 3
sqrt(-1); // throws NegativeError
```

::: tip
Generic functions lose their type parameters when wrapped with `throwing`. Write throwing versions
of such functions manually using `unwrap`.
:::
