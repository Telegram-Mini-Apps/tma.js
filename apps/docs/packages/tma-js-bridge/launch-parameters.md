# Launch Parameters

Launch parameters are essential to the mini application lifecycle. To learn more about what launch
parameters are and their importance, it is worth reading [this](../../platform/launch-parameters.md)
article.

## Retrieving Launch Parameters

The `retrieveLaunchParams` function extracts launch parameters from the current environment:

```ts
import { retrieveLaunchParams } from '@tma.js/bridge';

retrieveLaunchParams();
// {
//   tgWebAppPlatform: 'tdesktop',
//   tgWebAppVersion: '9.1',
//   tgWebAppThemeParams: { bg_color: '#17212b', ... },
//   tgWebAppData: 'user=%7B%22id%22%3A...&auth_date=...&hash=...',
//   tgWebAppStartParam: 'debug',
//   tgWebAppBotInline: false,
//   ...
// }
```

The result has the `LaunchParams` type:

| Property                | Type                | Description                                                   |
|-------------------------|---------------------|---------------------------------------------------------------|
| `tgWebAppPlatform`      | `Platform`          | Telegram client platform. Always present.                     |
| `tgWebAppVersion`       | `Version`           | Mini Apps version supported by the client. Always present.    |
| `tgWebAppThemeParams`   | `ThemeParams`       | Theme parameters. An empty object if not passed.              |
| `tgWebAppData`          | `string`            | Init data in the raw format.                                  |
| `tgWebAppDefaultColors` | `ThemeParams`       | Default theme colors.                                         |
| `tgWebAppStartParam`    | `string`            | Start parameter passed in the mini app link.                  |
| `tgWebAppBotInline`     | `boolean`           | True if the app was launched in inline mode.                  |
| `tgWebAppFullscreen`    | `boolean`           | True if the app was launched in fullscreen mode.              |
| `tgWebAppShowSettings`  | `boolean`           | True if the Settings Button should be displayed.              |

Unknown parameters are not included in the result.

::: tip
`tgWebAppData` is a raw string. To get the init data as an object, parse it with the
[@tma.js/init-data](../tma-js-init-data.md) package, or use the `initData` component of
[@tma.js/sdk](../tma-js-sdk.md).
:::

If launch parameters were not found in any source, the function throws
`LaunchParamsRetrieveError`. Its `data.errors` property lists the error collected for each source.
To get the error as a value instead, use `safeRetrieveLaunchParams`:

```ts
import { safeRetrieveLaunchParams } from '@tma.js/bridge';

const result = safeRetrieveLaunchParams();
if (result.ok) {
  console.log(result.data.tgWebAppPlatform);
} else {
  console.error(result.error.data.errors);
}
```

Learn more about the `safe` functions in the [Handling Errors](errors.md) article.

### Sources

Telegram passes launch parameters in the URL hash. The app may change the URL (for example, while
navigating), and then the page may be reloaded. That's why the package looks for launch parameters
in several sources in the following order:

1. `window.location.href`;
2. the initial page URL (the navigation entry of the
   [Performance API](https://developer.mozilla.org/docs/Web/API/Performance/getEntriesByType));
3. the session storage value previously saved by this package;
4. the session storage value saved by the official SDK.

Launch parameters found in any source are saved in the session storage, so they survive page
reloads.

### Raw

To retrieve launch parameters in their initial format, as query parameters, use the
`retrieveRawLaunchParams` function (or its `safeRetrieveRawLaunchParams` counterpart):

```ts
import { retrieveRawLaunchParams } from '@tma.js/bridge';

retrieveRawLaunchParams();
// 'tgWebAppPlatform=tdesktop&tgWebAppVersion=9.1&tgWebAppData=user%3D...&...'
```

## Retrieving Raw Init Data

It is a rather common case when the application requires extracting init data in its raw format
to send it to a backend server. Use the `retrieveRawInitData` function (or its
`safeRetrieveRawInitData` counterpart) designed for this purpose:

```ts
import { retrieveRawInitData } from '@tma.js/bridge';

const initDataRaw = retrieveRawInitData();
// 'user=%7B%22id%22%3A...&auth_date=...&hash=...' or undefined

fetch('https://example.com/api', {
  method: 'POST',
  headers: { Authorization: `tma ${initDataRaw}` },
});
```

The function returns `undefined` if launch parameters don't contain init data. The returned value
is exactly what the Telegram client passed, so it can be [validated](../../platform/init-data.md#validating)
on the server side.

## Parsing and Serializing

To parse launch parameters from their query representation, use `parseLaunchParams`. It accepts
a string or `URLSearchParams` and throws `InvalidLaunchParamsError` if the value doesn't represent
valid launch parameters. `safeParseLaunchParams` returns the error instead.

```ts
import { parseLaunchParams, safeParseLaunchParams } from '@tma.js/bridge';

parseLaunchParams('tgWebAppPlatform=ios&tgWebAppVersion=9.0');
// { tgWebAppPlatform: 'ios', tgWebAppVersion: '9.0', tgWebAppThemeParams: {} }

safeParseLaunchParams('tgWebAppPlatform=ios').ok; // false
```

`tgWebAppPlatform` and `tgWebAppVersion` are required and must not be empty.

The `serializeLaunchParams` function performs the reverse operation:

```ts
import { serializeLaunchParams } from '@tma.js/bridge';

serializeLaunchParams({
  tgWebAppPlatform: 'ios',
  tgWebAppVersion: '9.0',
  tgWebAppThemeParams: { bg_color: '#ffffff' },
  tgWebAppBotInline: true,
});
// 'tgWebAppPlatform=ios&tgWebAppVersion=9.0&tgWebAppThemeParams=%7B%22bg_color%22%3A%22%23ffffff%22%7D&tgWebAppBotInline=1'
```

## Start Parameter

The [start parameter](../../platform/start-parameter.md) allows passing data to the mini app via
its link. It is limited to 512 characters from the `A-Za-z0-9_-` set, so the package provides
functions encoding any value to a valid start parameter using base64url.

To create a start parameter, use `createStartParam`. Strings are encoded as is, other values are
converted to JSON first. If the encoded value exceeds 512 characters, the function throws
`StartParamTooLongError`. `safeCreateStartParam` returns the error instead.

```ts
import { createStartParam, isSafeToCreateStartParam } from '@tma.js/bridge';

createStartParam({ page: 'product', id: 42 });
// 'eyJwYWdlIjoicHJvZHVjdCIsImlkIjo0Mn0'

// Checks if the string is short enough to become a start parameter.
isSafeToCreateStartParam('very long string...'); // true
```

To decode the start parameter, use `decodeStartParam`. As the second argument, pass `'json'` to
parse the decoded value as JSON, or a custom parser:

```ts
import { decodeStartParam, retrieveLaunchParams } from '@tma.js/bridge';

const { tgWebAppStartParam } = retrieveLaunchParams();
if (tgWebAppStartParam) {
  decodeStartParam(tgWebAppStartParam); // '{"page":"product","id":42}'
  decodeStartParam(tgWebAppStartParam, 'json'); // { page: 'product', id: 42 }
  decodeStartParam(tgWebAppStartParam, value => value.length); // 26
}
```

`decodeStartParam` throws if the value is not a valid base64url string, or if the parser throws.

The underlying `encodeBase64Url` and `decodeBase64Url` functions are exported too.
