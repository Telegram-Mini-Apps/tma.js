# Validating

Telegram signs init data, so the server can make sure it was issued to a specific user and wasn't
changed. There are two ways to check the signature:

- [Using the bot token](#validating-with-bot-token). This is the usual way for the bot owner.
- [Using the Telegram public key](#third-party-validation). This way only requires the bot
  identifier and is useful for third parties receiving init data of another bot.

To learn how the validation works, see the [platform documentation](../../platform/init-data.md#validating).

## Validating with Bot Token

To validate init data, use the `validate` function. It expects init data in the raw format
(a query string or `URLSearchParams`) and the bot token. If init data is valid, the function
returns the parsed init data:

```ts
import { validate } from '@tma.js/init-data';

const initData = await validate(
  // Init data.
  'query_id=AAHdF6IQAAAAAN0XohDhrOrc' +
  '&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%7D' +
  '&auth_date=1662771648' +
  '&hash=c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2',
  // Bot secret token.
  '5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8',
  // This sample init data was created long ago. Don't disable the expiration check
  // in real applications.
  { expiresIn: 0 },
);

console.log(initData.user?.id); // 279058397
```

The function throws one of these errors if init data is invalid:

- `SignatureMissingError`: the `hash` parameter is missing or empty;
- `AuthDateInvalidError`: the `auth_date` parameter is missing or isn't a Unix time;
- `ExpiredError`: init data has expired;
- `SignatureInvalidError`: init data wasn't signed with the specified bot token;
- `InvalidInitDataError`: init data is signed, but has an unexpected structure.

To get the error instead of throwing it, use `safeValidate`. The returned error has
the `ValidateError` type, which is a union of all the errors above:

```ts
import { matchError, safeValidate } from '@tma.js/init-data';

const result = await safeValidate(rawInitData, botToken);
if (!result.ok) {
  return matchError(result.error, {
    SignatureMissingError: () => reply(401, 'Init data is not signed'),
    AuthDateInvalidError: () => reply(401, 'Init data has no valid auth date'),
    ExpiredError: () => reply(401, 'Init data has expired'),
    SignatureInvalidError: () => reply(403, 'Init data signature is invalid'),
    InvalidInitDataError: () => reply(400, 'Init data has an unexpected structure'),
  });
}
const initData = result.data;
```

Learn more about handling errors in the [package overview](../tma-js-init-data.md#error-handling).

### Expiration

By default, the function checks the init data expiration. Init data is considered valid for 1 day
(86,400 seconds) since its creation (the `auth_date` parameter). It is recommended to always check
the expiration, as init data could be stolen but still remain valid.

To change the expiration time, pass the `expiresIn` option in seconds. To disable the check, pass
`0`:

```ts
// Init data is valid for 1 hour.
await validate(rawInitData, botToken, { expiresIn: 3600 });

// Init data never expires.
await validate(rawInitData, botToken, { expiresIn: 0 });
```

### Checking Validity

To get a boolean value instead of the parsed init data, use the `isValid` function:

```ts
import { isValid } from '@tma.js/init-data';

if (await isValid(rawInitData, botToken)) {
  console.log('Init data signature is fine');
}
```

It accepts the same options as `validate`.

::: warning

`isValid` checks only the signature and the expiration. It doesn't parse init data, so
`isValid` returning `true` doesn't guarantee that `validate` succeeds: signed init data may still
have an unexpected structure. If you are going to use the init data, call `validate` instead.

:::

## Secret Key

Each call accepting the bot token derives a secret key from it, which requires an additional
HMAC computation. To do it once, create the secret key using `createSecretKey` and pass it
instead of the token. The key is a [`CryptoKey`](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey)
object:

```ts
import { createSecretKey, validate } from '@tma.js/init-data';

// Create the key once, e.g. on the server start.
const secretKey = await createSecretKey(botToken);

// Reuse it in each request.
await validate(rawInitData, secretKey);
```

All functions accepting the bot token (`validate`, `safeValidate`, `isValid`, `sign`, `signData`)
accept the `Secret` type, which is either the bot token or the secret key.

### Using Hashed Token

If the server only validates init data, it doesn't need the bot token at all. Instead, it can
store the bot token hash. By the hash, we mean the bot token signed using HMAC-SHA-256 with
the `WebAppData` key, as specified in the [validation](../../platform/init-data.md#validating)
section of the documentation.

To create the hash, use the `hashToken` function. It returns the hash in the hex format. Then,
pass the hash to `createSecretKey` with the `hashed` option:

```ts
import { createSecretKey, hashToken, validate } from '@tma.js/init-data';

// Run once and store the result, e.g. in an environment variable.
await hashToken('5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8');
// 'a5c609aa52f63cb5e6d8ceb6e4138726ea82bbc36bb786d64482d445ea38ee5f'

// On the server.
const secretKey = await createSecretKey(process.env.BOT_TOKEN_HASH!, { hashed: true });
await validate(rawInitData, secretKey);
```

This way, you reduce the number of places where the raw token is stored. Note that the hash still
allows signing init data, so keep it secret too.

If the hash isn't a SHA-256 hash in the hex format, `createSecretKey` throws `TypeError`.

## Third-party Validation

Telegram also signs init data with its Ed25519 key, so init data can be validated without the bot
token, using only the bot identifier. This is useful for third parties receiving init data of
another bot.

To perform this kind of validation, use the `validate3rd` function. It accepts init data in the
same format as `validate` and the identifier of the bot the init data was issued for. If init data
is valid, the function returns the parsed init data:

```ts
import { validate3rd } from '@tma.js/init-data';

const initData = await validate3rd(
  // Init data.
  'user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%20%2B%20-%20%3F%20%5C%2F%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%22%7D' +
  '&chat_instance=8134722200314281151' +
  '&chat_type=private' +
  '&auth_date=1733584787' +
  '&signature=zL-ucjNyREiHDE8aihFwpfR9aggP2xiAo3NSpfe-p7IbCisNlDKlo7Kb6G4D0Ao2mBrSgEk4maLSdv6MLIlADQ' +
  '&hash=2174df5b000556d044f3f020384e879c8efcab55ddea2ced4eb752e93e7080d6',
  // Bot identifier.
  7342037359,
  // This sample init data was created long ago. Don't disable the expiration check
  // in real applications.
  { expiresIn: 0 },
);
```

The third argument is an object with the following options:

- `expiresIn: number`: init data expiration time in seconds, the same as
  for [`validate`](#expiration). Defaults to 1 day.
- `test: boolean`: should be `true` if init data was received in the Telegram test environment.
  Defaults to `false`.

```ts
// Init data from the Telegram test environment.
await validate3rd(rawInitData, botId, { test: true });
```

The function throws the same errors as `validate`. The only difference is that
`SignatureMissingError` is thrown if the `signature` parameter is missing. Its `data.param`
property is equal to `'signature'` in this case.

To get the error instead of throwing it, use `safeValidate3rd`. To get a boolean value, use
`isValid3rd`:

```ts
import { isValid3rd, safeValidate3rd } from '@tma.js/init-data';

const result = await safeValidate3rd(rawInitData, 7342037359);
if (!result.ok) {
  console.error(result.error.name);
}

if (await isValid3rd(rawInitData, 7342037359)) {
  console.log('Init data signature is fine');
}
```

As well as `isValid`, `isValid3rd` doesn't check the init data structure.

::: warning

Third-party validation requires Ed25519 support in the Web Crypto API. If the runtime doesn't
support it, `validate3rd`, `safeValidate3rd` and `isValid3rd` reject with the error thrown by the
runtime. See [Runtime Requirements](../tma-js-init-data.md#runtime-requirements).

:::
