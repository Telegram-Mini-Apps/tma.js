# Migrating from @telegram-apps/init-data-node

This guide provides a summary of the migration process from `@telegram-apps/init-data-node` to `@tma.js/init-data-node`.

## `parse`

- The function now has no way of returning a camel-cased version of init data. Instead, it always returns them
  in form they were passed from Telegram. Nevertheless, you can import the `deepSnakeToCamelObjKeys` function from the
  package in order to deeply camelize keys:

```typescript
import { deepSnakeToCamelObjKeys, parse } from '@tma.js/init-data-node';

const initDataCamelCased = deepSnakeToCamelObjKeys(parse('...'));
```

## Errors

- The following functions were removed:
  - `isAuthDateInvalidError`
  - `isSignatureInvalidError`
  - `isHexStringLengthInvalidError`
  - `isSignatureMissingError`
  - `isExpiredError`

Instead, you should use the errors' static `is()` method:

```typescript
import { ExpiredError } from '@tma.js/bridge';

if (ExpiredError.is(someValue)) {
  // someValue is instance of ExpiredError.
}
```
