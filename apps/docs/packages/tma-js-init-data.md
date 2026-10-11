---
outline: [2, 3]
---

# @tma.js/init-data

<p style="display: flex; gap: 8px; min-height: 20px">
  <a href="https://npmjs.com/package/@tma.js/init-data">
    <img src="https://img.shields.io/npm/v/@tma.js/init-data?logo=npm"/>
  </a>
  <a href="https://github.com/Telegram-Mini-Apps/tma.js/tree/master/packages/init-data">
    <img src="https://img.shields.io/badge/source-black?logo=github"/>
  </a>
</p>

The package provides utilities to parse, validate and sign Telegram Mini Apps initialization data
on the server side. To learn more about the initialization data and its usage, please refer to
the [documentation](../platform/init-data.md).

The package is built on the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
only, so the same code works in Node.js, Bun, Deno, Cloudflare Workers and other modern runtimes.

::: tip

This package replaces `@tma.js/init-data-node`. If you are using it, follow
the [migration guide](./tma-js-init-data/migrate-from-init-data-node.md).

:::

## Installation

::: code-group

```bash [pnpm]
pnpm i @tma.js/init-data
```

```bash [npm]
npm i @tma.js/init-data
```

```bash [yarn]
yarn add @tma.js/init-data
```

:::

## Runtime Requirements

The package has no runtime-specific code. It requires the global `crypto.subtle` object (Web
Crypto API) with the following algorithms:

- **HMAC with SHA-256**: used by [validating](./tma-js-init-data/validating.md)
  with the bot token and [signing](./tma-js-init-data/signing.md).
- **Ed25519**: used only by [third-party validation](./tma-js-init-data/validating.md#third-party-validation).
  If the runtime doesn't support it, third-party validation functions reject with the error
  thrown by the runtime.

The package supports Node.js 20 and later, Bun, Deno and Cloudflare Workers. If you use
third-party validation, make sure your runtime version supports Ed25519 in the Web Crypto API.
The package is shipped as ESM and CommonJS, and as an IIFE build exposing the `tmajs.initData`
global for loading via a `<script>` tag from a CDN
(`https://cdn.jsdelivr.net/npm/@tma.js/init-data@1/dist/index.iife.js`).

As Web Crypto is asynchronous, all functions working with signatures (`validate`, `isValid`,
`sign`, etc.) return promises. Only [parsing](./tma-js-init-data/parsing.md) functions are
synchronous.

## Quick Start

The most common task is authorizing a user who sends init data to the server. The `validate`
function checks the init data signature and expiration, and returns the parsed init data:

```ts
import { validate } from '@tma.js/init-data';

// Raw init data sent by the client, e.g. in the Authorization header.
const initData = await validate(rawInitData, botToken);

console.log(initData.user?.id, initData.auth_date);
```

Here is a complete example of an HTTP server authorizing users. It expects init data to be passed
in the `Authorization` header in the `tma <init data>` format (see
the [client side](../platform/authorizing-user.md#client) example).

::: code-group

```ts [Fetch API (Bun, Deno, Workers)]
import { safeValidate } from '@tma.js/init-data';

// Your secret bot token.
const botToken = '1234567890:ABC';

export default {
  async fetch(request: Request): Promise<Response> {
    const [authType, authData = ''] = (request.headers.get('authorization') || '').split(' ');
    if (authType !== 'tma') {
      return new Response('Unauthorized', { status: 401 });
    }

    // We consider init data valid for 1 hour since its creation.
    const result = await safeValidate(authData, botToken, { expiresIn: 3600 });
    if (!result.ok) {
      return new Response(result.error.message, { status: 401 });
    }
    return Response.json(result.data);
  },
};
```

```ts [Express (Node.js)]
import { createSecretKey, validate, type InitData } from '@tma.js/init-data';
import express, {
  type ErrorRequestHandler,
  type RequestHandler,
  type Response,
} from 'express';

// Your secret bot token.
const secretKey = await createSecretKey('1234567890:ABC');

/**
 * @returns Init data stored in the Response object, or undefined if the client is not
 * authorized.
 * @param res - Response object.
 */
function getInitData(res: Response): InitData | undefined {
  return res.locals.initData;
}

/**
 * Middleware which authorizes the client.
 */
const authMiddleware: RequestHandler = async (req, res, next) => {
  // We expect passing init data in the Authorization header in the following format:
  // <auth-type> <auth-data>
  // <auth-type> must be "tma", and <auth-data> is Telegram Mini Apps init data.
  const [authType, authData = ''] = (req.header('authorization') || '').split(' ');

  switch (authType) {
    case 'tma':
      try {
        // Validate and parse init data. We consider init data valid for 1 hour since its
        // creation.
        res.locals.initData = await validate(authData, secretKey, { expiresIn: 3600 });
        return next();
      } catch (e) {
        return next(e);
      }
    // ... other authorization methods.
    default:
      return next(new Error('Unauthorized'));
  }
};

/**
 * Middleware which shows the user init data.
 */
const showInitDataMiddleware: RequestHandler = (_req, res, next) => {
  const initData = getInitData(res);
  if (!initData) {
    return next(new Error('Cant display init data as long as it was not found'));
  }
  res.json(initData);
};

/**
 * Middleware which handles errors.
 */
const defaultErrorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  res.status(500).json({ error: err.message });
};

const app = express();

app.use(authMiddleware);
app.get('/', showInitDataMiddleware);
app.use(defaultErrorMiddleware);

app.listen(3000);
```

:::

## Error Handling

Each throwing function has a `safe` counterpart returning the error instead of throwing it:

| Throwing      | Safe              |
|---------------|-------------------|
| `parse`       | `safeParse`       |
| `validate`    | `safeValidate`    |
| `validate3rd` | `safeValidate3rd` |

A safe function returns the `Result` object. It is either `{ ok: true, data }` or
`{ ok: false, error }`. The error type is a union of all expected errors, so the compiler knows
what to handle:

```ts
import { safeValidate } from '@tma.js/init-data';

const result = await safeValidate(rawInitData, botToken);
if (result.ok) {
  // result.data is InitData.
  console.log(result.data.user);
} else {
  // result.error is ValidateError.
  console.error(result.error.message);
}
```

To handle each error separately, use the `matchError` function. Compilation fails if any error is
left unhandled:

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

Each error class also has the static `is` method to check a single error. It works with both
thrown and returned errors:

```ts
import { ExpiredError, validate } from '@tma.js/init-data';

try {
  await validate(rawInitData, botToken);
} catch (e) {
  if (ExpiredError.is(e)) {
    console.log('Init data issued at', e.data.issuedAt, 'has expired');
  }
}
```

The package exports the following error classes:

| Error                   | Reason                                                                                                                                         |
|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| `InvalidInitDataError`  | The value doesn't represent valid init data. `data.value` contains the value, `cause` contains the [valibot](https://valibot.dev) error.        |
| `SignatureMissingError` | The parameter containing the signature is missing. `data.param` is `'hash'` or `'signature'` (for third-party validation).                     |
| `SignatureInvalidError` | The signature doesn't match the init data.                                                                                                     |
| `AuthDateInvalidError`  | The `auth_date` parameter is missing or isn't a Unix time. `data.value` contains the passed value.                                             |
| `ExpiredError`          | Init data has expired. `data` contains the `issuedAt`, `expiresAt` and `now` dates.                                                            |

::: info

Safe functions return only expected errors. Unexpected ones, like a broken or incomplete Web Crypto
implementation, are still thrown.

:::

## Types

The package exports the following types:

- `InitData`, `User`, `Chat`, `ChatType`: parsed init data and its parts. See
  [Parsing](./tma-js-init-data/parsing.md).
- `Secret`: a bot token or a secret key. See [Validating](./tma-js-init-data/validating.md#secret-key).
- `SignableInitData`: init data accepted by `sign`. See [Signing](./tma-js-init-data/signing.md).
- `ValidateOptions`, `Validate3rdOptions`: validation options.
- `ValidateError`: union of all errors returned by `safeValidate` and `safeValidate3rd`.
- `Result`: result of a safe function.
