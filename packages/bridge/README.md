# @tma.js/bridge

Communication layer between a Telegram Mini App and the Telegram client. It has no runtime
dependencies and works together with the official SDK
([telegram-web-app.js](https://telegram.org/js/telegram-web-app.js)) loaded on the same page.

```bash
pnpm i @tma.js/bridge
```

## Calling methods

```ts
import { postEvent } from '@tma.js/bridge';

postEvent('web_app_ready');
postEvent('web_app_setup_back_button', { is_visible: true });
```

Method names and parameters are typed. `postEvent` throws `UnknownEnvError` if the app was
opened outside Telegram.

To make sure the method is supported by the current Telegram client, create a checked function:

```ts
import { createPostEvent, retrieveLaunchParams } from '@tma.js/bridge';

const postEvent = createPostEvent(retrieveLaunchParams().tgWebAppVersion);
// Throws MethodUnsupportedError in Mini Apps versions lower than 6.2.
postEvent('web_app_open_popup', { title: 'Hi', message: 'Hello', buttons: [{ id: 'ok', type: 'ok' }] });
```

Pass `'non-strict'` or a function as the second argument to warn or handle unsupported calls
yourself. Use `supports` and `getReleaseVersion` for manual checks.

## Listening to events

```ts
import { onEvent, offEvent, onAnyEvent } from '@tma.js/bridge';

const stop = onEvent('viewport_changed', ({ height, is_expanded }) => {
  console.log(height, is_expanded);
});
stop();

onEvent('back_button_pressed', () => history.back(), { once: true });
onEvent('theme_changed', console.log, { signal: abortController.signal });
onAnyEvent(({ name, payload }) => console.log(name, payload));
```

## Requests

`request` calls a method and waits for an event:

```ts
import { request, createRequestId, captureSameReq } from '@tma.js/bridge';

const { button_id } = await request('web_app_open_popup', 'popup_closed', {
  params: { title: 'Hi', message: 'Hello', buttons: [{ id: 'ok', type: 'ok' }] },
});

// Waiting for one of several events.
const { event, payload } = await request(
  'web_app_request_fullscreen',
  ['fullscreen_changed', 'fullscreen_failed'],
  { timeout: 5000, signal },
);

// Capturing the event related to the request.
const reqId = createRequestId();
const { data } = await request('web_app_read_text_from_clipboard', 'clipboard_text_received', {
  params: { req_id: reqId },
  capture: captureSameReq(reqId),
});
```

Custom methods have a dedicated helper:

```ts
import { invokeCustomMethod } from '@tma.js/bridge';

const keys = await invokeCustomMethod('getStorageKeys', {});
```

## Handling errors

Functions failing with expected errors have a `safe` counterpart returning the error instead of
throwing it. The error type is a union of all possible errors, so the compiler knows what to
handle:

```ts
import { matchError, safeInvokeCustomMethod } from '@tma.js/bridge';

const result = await safeInvokeCustomMethod('getStorageKeys', {}, { timeout: 5000 });
if (!result.ok) {
  // Compilation fails if any error is left unhandled.
  return matchError(result.error, {
    InvokeCustomMethodFailedError: e => console.error('Method failed:', e.data.error),
    TimeoutError: () => console.error('No response from Telegram'),
  });
}
const keys = result.data;
```

| Function                   | Safe counterpart               | Errors                                           |
|----------------------------|--------------------------------|--------------------------------------------------|
| `request`                  | `safeRequest`                  | `TimeoutError`                                   |
| `invokeCustomMethod`       | `safeInvokeCustomMethod`       | `InvokeCustomMethodFailedError`, `TimeoutError`  |
| `parseLaunchParams`        | `safeParseLaunchParams`        | `InvalidLaunchParamsError`                       |
| `retrieveLaunchParams`     | `safeRetrieveLaunchParams`     | `LaunchParamsRetrieveError`                      |
| `retrieveRawLaunchParams`  | `safeRetrieveRawLaunchParams`  | `LaunchParamsRetrieveError`                      |
| `retrieveRawInitData`      | `safeRetrieveRawInitData`      | `LaunchParamsRetrieveError`                      |
| `createStartParam`         | `safeCreateStartParam`         | `StartParamTooLongError`                         |

Environment and usage errors are always thrown: `UnknownEnvError` when the app is opened outside
Telegram, and `MethodUnsupportedError` or `MethodParameterUnsupportedError` from functions created
with `createPostEvent`. Aborted requests are rejected with `signal.reason`, as other abortable APIs
are.

## Environment

```ts
import {
  isTMA,
  isTMAAsync,
  retrieveLaunchParams,
  retrieveRawInitData,
} from '@tma.js/bridge';

isTMA(); // Synchronous check based on environment traits.
await isTMAAsync(); // Asks the Telegram client and waits for a response.

const { tgWebAppPlatform, tgWebAppVersion, tgWebAppThemeParams } = retrieveLaunchParams();
const initData = retrieveRawInitData(); // Send it to your server.
```

Launch parameters are looked up in the URL, the navigation entry, and the session storage
(including the one written by the official SDK), so they survive page reloads.

## Mocking

`mockTelegramEnv` imitates the Telegram client. Outside iframes, it defines
`window.TelegramWebviewProxy`, so calls made by other libraries, including the official SDK, are
intercepted too. In Telegram Web (iframe), only calls made by this package are intercepted.

```ts
import { emitEvent, mockTelegramEnv } from '@tma.js/bridge';

const restore = mockTelegramEnv({
  launchParams: {
    tgWebAppPlatform: 'tdesktop',
    tgWebAppVersion: '9.0',
    tgWebAppThemeParams: { bg_color: '#17212b', text_color: '#f5f5f5' },
  },
  onMethod({ name }, next) {
    if (name === 'web_app_request_theme') {
      return emitEvent('theme_changed', { theme_params: { bg_color: '#17212b' } });
    }
    next();
  },
});
```

## Start parameter

```ts
import { createStartParam, decodeStartParam } from '@tma.js/bridge';

const param = createStartParam({ page: 'product', id: 42 });
decodeStartParam(param, 'json'); // { page: 'product', id: 42 }
```

## Debugging

```ts
import { setDebug, setLogger } from '@tma.js/bridge';

setDebug(true); // Logs outgoing methods and incoming events.
setLogger(myLogger); // { log, warn, error }
```
