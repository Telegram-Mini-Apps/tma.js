---
outline: [2, 3]
---

# Migrating from @tma.js/init-data-node

This guide describes how to migrate from `@tma.js/init-data-node` to `@tma.js/init-data`.
`@tma.js/init-data-node` is deprecated and won't receive updates.

To see what has changed in other tma.js packages, see the [upgrading guide](../upgrading.md).

::: info Using @telegram-apps/init-data-node?

The even older `@telegram-apps/init-data-node` package follows this guide too. Additionally, take
into account the changes it had before `@tma.js/init-data-node`:

- `parse` can't return init data with camel-cased keys anymore. Keys are always kept as Telegram
  sends them.
- The `isAuthDateInvalidError`, `isSignatureInvalidError`, `isHexStringLengthInvalidError`,
  `isSignatureMissingError` and `isExpiredError` functions were removed. Use the static `is`
  method of error classes instead, e.g. `ExpiredError.is(error)`.

:::

## Package

The package was renamed to `@tma.js/init-data`:

::: code-group

```bash [pnpm]
pnpm rm @tma.js/init-data-node
pnpm i @tma.js/init-data
```

```bash [npm]
npm rm @tma.js/init-data-node
npm i @tma.js/init-data
```

```bash [yarn]
yarn remove @tma.js/init-data-node
yarn add @tma.js/init-data
```

:::

::: warning

The `@tma.js/init-data` name was previously used by a different frontend package, which was
deprecated long ago. Make sure you install the latest major version of the package.

:::

The package has a single entry point. The `@tma.js/init-data-node/web` entry point was removed,
as the whole package is now built on the Web Crypto API only. It uses neither `node:crypto` nor
`Buffer`, and works in Node.js 20 and later, Bun, Deno and Cloudflare Workers. Learn more about
the [runtime requirements](../tma-js-init-data.md#runtime-requirements).

```ts
// Before.
import { validate } from '@tma.js/init-data-node';
import { validate } from '@tma.js/init-data-node/web';

// After.
import { validate } from '@tma.js/init-data';
```

## Everything Is Async

The synchronous Node.js API was removed. All functions working with signatures now return
promises: `validate`, `validate3rd`, `isValid`, `isValid3rd`, `sign`, `signData`, `hashToken` and
the new `createSecretKey`. Only `parse`, `safeParse` and `serialize` remain synchronous.

```ts
// Before (Node.js).
import { validate } from '@tma.js/init-data-node';

validate(rawInitData, botToken);

// After.
import { validate } from '@tma.js/init-data';

await validate(rawInitData, botToken);
```

Functions of the removed `web` entry point returned `BetterPromise` and accepted its options, such
as `timeout` and `abortSignal`. Now they return regular promises, and these options were removed.

## Functional Approach

The `fp-ts` based functions were removed. Each throwing function now has a `safe` counterpart
returning the `Result` object (`{ ok: true, data }` or `{ ok: false, error }`) instead of
`Either` or `TaskEither`:

| Before          | After                                                     |
|-----------------|-----------------------------------------------------------|
| `parseFp`       | `safeParse`                                               |
| `validateFp`    | `safeValidate`                                            |
| `validate3rdFp` | `safeValidate3rd`                                         |
| `isValidFp`     | Removed, use `isValid`.                                   |
| `isValid3rdFp`  | Removed, use `isValid3rd`.                                |
| `signFp`        | Removed, use `sign`.                                      |
| `signDataFp`    | Removed, use `signData`.                                  |

::: code-group

```ts [Before]
import { validateFp } from '@tma.js/init-data-node';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

pipe(validateFp(rawInitData, botToken), E.match(
  error => {
    // Something went wrong.
  },
  () => {
    // Data is valid.
  },
));
```

```ts [After]
import { safeValidate } from '@tma.js/init-data';

const result = await safeValidate(rawInitData, botToken);
if (result.ok) {
  // Data is valid, result.data contains parsed init data.
} else {
  // Something went wrong, result.error contains the error.
}
```

:::

Use the `matchError` function exported from the package to handle each error separately. Learn
more in the [Error Handling](../tma-js-init-data.md#error-handling) section.

## Validating

### Returning Parsed Data

`validate` and `validate3rd` now return the parsed init data, so there is no need to call `parse`
after them:

```ts
// Before.
import { parse, validate } from '@tma.js/init-data-node';

validate(rawInitData, botToken);
const initData = parse(rawInitData);

// After.
import { validate } from '@tma.js/init-data';

const initData = await validate(rawInitData, botToken);
```

::: warning

As `validate` and `validate3rd` now parse init data, they throw `InvalidInitDataError` if init
data is signed but has an unexpected structure. Previously, such init data passed the validation.
Accordingly, the `ValidateError` type now includes `InvalidInitDataError`.

:::

### `isValid` and `isValid3rd`

`isValid` and `isValid3rd` now always return a promise.

::: warning

`isValid` and `isValid3rd` check only the signature and the expiration. They don't parse init data,
so `true` doesn't guarantee that `validate` succeeds.

Previously, `isValid3rd` returned `false` on any error. Now, it rejects if Web Crypto fails, e.g.
when the runtime doesn't support Ed25519.

:::

### Stricter Checks

::: warning

- `auth_date` must consist of digits only. Previously, values like `1662771648abc` were accepted,
  as the value was parsed with `parseInt`. Now, `AuthDateInvalidError` is thrown.
- `hash` must be a 64-character hex string. Otherwise, `SignatureInvalidError` is thrown.
- The `hash` signature is now compared in constant time using `crypto.subtle.verify`, which
  protects from timing attacks. As a side effect, a `hash` in the upper case is accepted too.

:::

## Secret Key and Hashed Token

The `tokenHashed` option was removed. Instead, create a secret key from the hashed token using
the `createSecretKey` function with the `hashed` option, and pass the key instead of the token:

```ts
// Before.
import { sign, validate } from '@tma.js/init-data-node';

validate(rawInitData, botTokenHash, { tokenHashed: true });
sign(data, botTokenHash, new Date(), { tokenHashed: true });

// After.
import { createSecretKey, sign, validate } from '@tma.js/init-data';

const secretKey = await createSecretKey(botTokenHash, { hashed: true });

await validate(rawInitData, secretKey);
await sign(data, secretKey);
```

All functions previously accepting the bot token now accept the `Secret` type: either the bot
token or a secret key created with `createSecretKey`. Creating the key once and reusing it saves
an HMAC computation on each call, so it is recommended even if you use the raw token:

```ts
const secretKey = await createSecretKey(botToken);
```

Other related changes:

- `hashToken` now returns a promise resolving to the hash in the hex format. Previously, it returned
  `Buffer` (Node.js) or `ArrayBuffer` (web). The hex string can be passed to `createSecretKey`
  directly.
- `createSecretKey` throws `TypeError` if the hashed token isn't a SHA-256 hash in the hex format.
  It replaces `HexStringLengthInvalidError`.
- The bot token, as well as the data passed to `signData` and `hashToken`, must be a string.
  `ArrayBuffer` is not accepted anymore.

Learn more in the [Validating](./validating.md#secret-key) section.

## Signing

The `sign` function signature has changed. The signing date argument and the options argument were
removed. The signing date is now passed as the `auth_date` property of the signed data, and
defaults to the current date:

```ts
// Before.
import { sign } from '@tma.js/init-data-node';

const rawInitData = sign({ user }, botToken, new Date());

// After.
import { sign } from '@tma.js/init-data';

const rawInitData = await sign({ user, auth_date: new Date() }, botToken);
// auth_date can be omitted to sign with the current date:
// await sign({ user }, botToken);
```

`signData` now accepts only the data and the secret: `signData(data: string, secret: Secret)`.

::: warning

`sign` now adds the `signature` parameter only if it is passed. Previously, the empty `signature=`
parameter was always added. As the parameter is a part of the signed data, the same data signed by
the old and the new versions produces different hashes.

:::

## Parsing

`parse` now throws `InvalidInitDataError` instead of `ValiError`. The original `ValiError` is
available in the `cause` property, and the parsed value is in the `data.value` property:

```ts
// Before.
import { parse } from '@tma.js/init-data-node';
import { ValiError } from 'valibot';

try {
  parse(rawInitData);
} catch (e) {
  if (e instanceof ValiError) {
    // ...
  }
}

// After.
import { InvalidInitDataError, parse } from '@tma.js/init-data';

try {
  parse(rawInitData);
} catch (e) {
  if (InvalidInitDataError.is(e)) {
    console.error(e.data.value, e.cause);
  }
}
```

The new `serialize` function converts init data back to the query format.

### Init Data Structure

Keys are still in the snake case, and `auth_date` is still `Date`. However, the `InitData` schema
has changed:

- `signature` is now optional. Previously, init data without it failed to parse.
- The `chat_join_request_query_id` property was added.

::: warning

- Unknown parameters, as well as unknown properties of `user`, `receiver` and `chat`, are now
  removed from the result. Previously, they were kept. If you rely on parameters not described in
  the [`InitData`](./parsing.md#parsed-data) type, read them from the raw init data, e.g. using
  `URLSearchParams`.
- If a parameter is repeated in the query, its first value is used.

:::

### `deepSnakeToCamelObjKeys`

The `deepSnakeToCamelObjKeys` function was removed without a replacement. Use the snake-cased keys
or convert them yourself.

## Errors

| Before                                | After                                                                                     |
|---------------------------------------|-------------------------------------------------------------------------------------------|
| `SignatureMissingError(thirdParty)`   | `SignatureMissingError`. The `data.param` property contains `'hash'` or `'signature'`.     |
| `ExpiredError`                        | The `now` date was added to the `data` property.                                          |
| `HexStringLengthInvalidError`         | Removed. `createSecretKey` throws `TypeError` instead.                                    |
| `ValiError` thrown by `parse`         | `InvalidInitDataError`.                                                                   |

The static `is` method is still available on all error classes.

## Removed Types

The following types were removed:

| Type                                       | Replacement                                         |
|--------------------------------------------|-----------------------------------------------------|
| `Text`                                     | `string`, or `Secret` for the bot token.            |
| `CreateHmacFn`                             | None.                                               |
| `ParseError`                               | `InvalidInitDataError`.                             |
| `ValidateValue`, `Validate3rdValue`        | `string \| URLSearchParams`.                        |
| `Validate3rdError`, `ValidateAsyncError`   | `ValidateError`.                                    |
| `ValidateAsyncOptions`                     | `ValidateOptions`.                                  |

The `InitData`, `User`, `Chat` and `ChatType` types are now declared in the package itself and
match the schema described above.
