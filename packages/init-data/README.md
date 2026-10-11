# @tma.js/init-data

Parse, validate and sign Telegram Mini Apps
[init data](https://docs.telegram-mini-apps.com/platform/init-data) on the server. Built on
Web Crypto, so it works in Node.js 20+, Bun, Deno, Cloudflare Workers and other modern runtimes.

```bash
pnpm i @tma.js/init-data
```

## Validating

`validate` checks the init data signature and expiration, and returns the parsed init data:

```ts
import { validate } from '@tma.js/init-data';

// Raw init data sent by the client, e.g. in the Authorization header.
const initData = await validate(rawInitData, botToken);
console.log(initData.user?.id, initData.auth_date);
```

It throws `SignatureMissingError`, `AuthDateInvalidError`, `ExpiredError`,
`SignatureInvalidError` or `InvalidInitDataError` if init data is invalid. Use `isValid` to get
a boolean instead.

### Handling errors

Each throwing function has a `safe` counterpart returning the error instead of throwing it.
The error type is a union of all possible errors, so the compiler knows what to handle:

```ts
import { matchError, safeValidate } from '@tma.js/init-data';

const result = await safeValidate(rawInitData, botToken);
if (!result.ok) {
  // Compilation fails if any error is left unhandled.
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

Each error class also has the `is` method to check a single error: `ExpiredError.is(result.error)`.
The `ValidateError` type is the union of all validation errors.

Safe functions return only expected errors. Unexpected ones, like a broken Web Crypto
implementation, are still thrown.

Init data expires in 1 day by default. Change it with the `expiresIn` option (in seconds), or
pass `0` to skip the check:

```ts
await validate(rawInitData, botToken, { expiresIn: 3600 });
```

### Secret key

Each call derives a key from the bot token. To do it once, create a secret key and pass it
instead of the token:

```ts
import { createSecretKey, validate } from '@tma.js/init-data';

const secretKey = await createSecretKey(botToken);
await validate(rawInitData, secretKey);
```

If the server only validates init data, it doesn't need the bot token at all. Store its hash
created with `hashToken` instead:

```ts
import { createSecretKey, hashToken } from '@tma.js/init-data';

await hashToken(botToken); // Run once, store the result.
const secretKey = await createSecretKey(process.env.BOT_TOKEN_HASH!, { hashed: true });
```

### Third-party validation

Init data of another bot can be validated without its token, using the Telegram public key:

```ts
import { validate3rd } from '@tma.js/init-data';

const initData = await validate3rd(rawInitData, botId);
// Or safeValidate3rd to get the error instead of throwing it.
// Init data from the Telegram test environment.
await validate3rd(rawInitData, botId, { test: true });
```

## Parsing

`parse` reads init data without checking its signature. It throws `InvalidInitDataError` if the
value has an unexpected structure. `safeParse` returns this error instead.

```ts
import { parse, serialize } from '@tma.js/init-data';

const initData = parse(rawInitData);
serialize(initData); // Back to the query format.
```

## Signing

`sign` creates init data signed with the bot token. It is useful to test the server or to mock
the Telegram environment:

```ts
import { sign } from '@tma.js/init-data';

const rawInitData = await sign({
  user: { id: 1, first_name: 'Pavel' },
  // Defaults to the current date.
  auth_date: new Date(),
}, botToken);
```

Use `signData` to sign an arbitrary data-check-string.
