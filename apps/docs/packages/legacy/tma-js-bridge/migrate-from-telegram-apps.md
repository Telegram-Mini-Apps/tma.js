# Migrating from @telegram-apps/bridge

This guide provides a summary of the migration process from `@telegram-apps/bridge` to `@tma.js/bridge`.

## `mockTelegramEnv`

- `onEvent` option now receives not a tuple, but an object with properties `event: string` and
  `params?: any`. The actual typing depends on the `event` property.

## `retrieveLaunchParams`

- The function now has no way of returning a camel-cased version of launch parameters. Instead, it always returns them
  in form they were passed from Telegram. Nevertheless, you can import the `deepSnakeToCamelObjKeys` function from the
  package in order to deeply camelize keys:

```typescript
import { deepSnakeToCamelObjKeys, retrieveLaunchParams } from '@tma.js/bridge';

const lpCamelCased = deepSnakeToCamelObjKeys(retrieveLaunchParams());
```

- Type `RetrieveLPResult` was renamed to `RetrieveLaunchParamsResult`;
- Type `RetrieveLPResultCamelCased` was removed.

## `on`

- Listening to all events (using `on(*)`) you will now receive not a tuple, but an object with properties
  `event: string` and `payload?: any`. The actual typing depends on the `event` property.

## `targetOrigin`

- This signal became readonly, so the `targetOrigin.set` method is inaccessible now. You should use the
  `setTargetOrigin` function instead:

```typescript
import { setTargetOrigin } from '@tma.js/bridge';

setTargetOrigin('https://some-domain.com');
```

## `debug`

- This signal became readonly, so the `debug.set` method is inaccessible now.

## `postMessageImplementation`

- The signal was renamed to `postMessageImpl`.

## Errors

- The following functions were removed:
  - `isMethodUnsupportedError`
  - `isMethodMethodParameterUnsupportedError`
  - `isLaunchParamsRetrieveError`
  - `isInvalidLaunchParamsError`
  - `isUnknownEnvError`
  - `isInvokeCustomMethodError`

Instead, you should use the errors' static `is()` method:

```typescript
import { UnknownEnvError } from '@tma.js/bridge';

if (UnknownEnvError.is(someValue)) {
  // someValue is instance of UnknownEnvError.
}
```

- `InvokeCustomMethodError` was renamed to `InvokeCustomMethodFailedError`