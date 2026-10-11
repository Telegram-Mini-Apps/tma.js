# Validating

The package provides utilities for both Node.js and non-Node.js environments. Node.js utilities are imported from
the root of the package. Web Crypto API (non-Node.js environments) utilities are imported from the `web` subdirectory,
these functions are all async due to the Web Crypto API nature.

:::code-group

```typescript [Node.js]
import { validate } from '@tma.js/init-data-node';

validate('...', '...');
```

```typescript [Web Crypto API]
import { validate } from '@tma.js/init-data-node/web';

await validate('...', '...');
```

:::

## General Init Data Validation

To validate the signature of the initialization data, the `validate` function is used. It expects
the initialization data to be passed in a raw format (query parameters) and throws an error in
certain cases.

:::code-group

```typescript [Node.js]
import { validate } from '@tma.js/init-data-node';

validate(
  // Init data.
  'query_id=AAHdF6IQAAAAAN0XohDhrOrc' +
  '&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%7D' +
  '&auth_date=1662771648' +
  '&hash=c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2',
  // Bot secret token.
  '5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8',
);
```

```typescript [Node.js (functional)]
import { validateFp } from '@tma.js/init-data-node';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

pipe(validateFp('...', '...'), E.match(
  error => {
    // Something went wrong.
  },
  () => {
    // Data is valid.
  },
));
```

```typescript [Web Crypto API]
import { validate } from '@tma.js/init-data-node/web';

await validate(
  // Init data.
  'query_id=AAHdF6IQAAAAAN0XohDhrOrc' +
  '&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%7D' +
  '&auth_date=1662771648' +
  '&hash=c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2',
  // Bot secret token.
  '5768337691:AAH5YkoiEuPk8-FZa32hStHTqXiLPtAEhx8',
);
```

```typescript [Web Crypto API (functional)]
import { validateFp } from '@tma.js/init-data-node/web';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

pipe(validateFp('...', '...'), TE.match(
  error => {
    // Something went wrong.
  },
  () => {
    // Data is valid.
  },
));
```

:::

Function will throw (or return) an error in one of these cases:

- `AuthDateInvalidError`: `auth_date` is empty or not found;
- `SignatureMissingError`: `hash` is empty or not found;
- `SignatureInvalidError`: signature is invalid;
- `ExpiredError`: init data expired.

Here is the code you could use to check the error type:

:::code-group

```typescript [non-functional]
import { validate } from '@tma.js/init-data-node';

try {
  validate('init data', 'token');
} catch (e) {
  if (SignatureInvalidError.is(e)) {
    console.log('Signature is invalid');
  }
}
```

```typescript [functional]
import { validateFp } from '@tma.js/init-data-node';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

pipe(validateFp('...', '...'), E.match(
  error => {
    if (SignatureInvalidError.is(error)) {
      console.log('Signature is invalid');
    }
  },
  () => {
    // Data is valid.
  },
));
```

:::

By default, the function checks the expiration of the initialization data. The default expiration
duration is set to 1 day (86,400 seconds). It is recommended to always check the expiration of the
initialization data, as it could be stolen but still remain valid. To disable this feature,
pass `{ expiresIn: 0 }` as the third argument.

Alternatively, to check the init data validity, a developer could use the `isValid` function.
It doesn't throw an error, but returns a boolean value indicating the init data validity.

:::code-group

```ts [Node.js]
import { isValid } from '@tma.js/init-data-node';

if (isValid('init data', 'bot secret token')) {
  console.log('Init data is fine');
}
```

```ts [Web Crypto API]
import { isValid } from '@tma.js/init-data-node/web';

if (await isValid('init data', 'bot secret token')) {
  console.log('Init data is fine');
}
```

```ts [Web Crypto API (functional)]
import { isValidFp } from '@tma.js/init-data-node/web';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

pipe(
  isValidFp('init data', 'bot secret token'),
  TE.match(
    error => {
      // Something exceptional went wrong.
    },
    isValid => {
      // ...
    },
  ),
);
```

:::

### Passing Hashed Token

This package allow developers to use a hashed token instead of a raw token.

By "hashed token," we mean a token hashed using the HMAC-SHA-256 algorithm with a key derived
from `WebAppData`, as specified in
the [validation](../../../platform/init-data#validating) section of the documentation.

Here are some examples:

```ts
import { validate } from '@tma.js/init-data-node';

validate(
  // Init data.
  'query_id=AAHdF6IQAAAAAN0XohDhrOrc' +
  '&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%7D' +
  '&auth_date=1662771648' +
  '&hash=c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2',
  // Hashed secret token.
  'a5c609aa52f63cb5e6d8ceb6e4138726ea82bbc36bb786d64482d445ea38ee5f',
  { tokenHashed: true },
);
```

You can use this approach to reduce the number of instances where you directly pass a raw token.

## Third-party Validation

The `validate3rd` function is used to check if the passed init data was signed by Telegram. As
well as the `validate` function, this one accepts the init data in the same format.

As the second argument, it accepts the Telegram Bot identifier that was used to sign this
init data.

The third argument is an object with the following properties:

- `expiresIn: number` is responsible for init data expiration validation;
- `test: boolean`: should be equal `true` if the init data was received in the Telegram test environment.

> [!WARNING]
> Unlike the `validate` function, `validate3rd` uses only Web Crypto API as long as Node.js lacks required functionality
> at the moment. Importing related functionality from the package's root or the `web` subdirectory, you will get
> the same functions.

Here is the usage example:

:::code-group

```ts [non-functional]
import { validate3rd } from '@tma.js/init-data-node';

await validate3rd(
  // Init data.
  'user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%20%2B%20-%20%3F%20%5C%2F%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%22%7D' +
  '&chat_instance=8134722200314281151' +
  '&chat_type=private' +
  '&auth_date=1733584787' +
  '&signature=zL-ucjNyREiHDE8aihFwpfR9aggP2xiAo3NSpfe-p7IbCisNlDKlo7Kb6G4D0Ao2mBrSgEk4maLSdv6MLIlADQ' +
  '&hash=2174df5b000556d044f3f020384e879c8efcab55ddea2ced4eb752e93e7080d6',
  // Bot ID.
  7342037359,
);
```

```ts [functional]
import { validate3rdFp } from '@tma.js/init-data-node';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

pipe(validate3rdFp('...', '...'), TE.match(
  error => {
    // Something went wrong.
  },
  () => {
    // Data is valid.
  },
));
```

:::

Function will throw (or return) an error in one of these cases:

- `AuthDateInvalidError`: `auth_date` is empty or not found;
- `SignatureMissingError`: `signature` is empty or not found;
- `SignatureInvalidError`: signature is invalid;
- `ExpiredError`: init data expired.

You can also use the `isValid3rd` function not throwing an error, but returning a boolean value:

:::code-group

```ts [non-functional]
import { isValid3rd } from '@tma.js/init-data-node';

if (await isValid3rd('init data', 7342037359)) {
  console.log('Init data is fine');
}
```

```ts [functional]
import { isValid3rdFp } from '@tma.js/init-data-node';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

pipe(
  isValid3rdFp('init data', 7342037359),
  TE.match(
    error => {
      // Something exceptional went wrong.
    },
    isValid => {
      // ...
    },
  ),
);
```

:::
