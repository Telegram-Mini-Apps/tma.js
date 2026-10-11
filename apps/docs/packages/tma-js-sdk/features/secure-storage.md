# 💠Secure Storage

A component responsible for the secure storage of sensitive data, like tokens, in Telegram Mini
Apps. The data is stored using the iOS Keychain and the Android Keystore. The secure storage is
supported since Mini Apps v9.0.

::: tip
To store non-sensitive data on the user's device, use [Device Storage](device-storage.md). To
store data in the cloud, use [Cloud Storage](cloud-storage.md).
:::

## Checking Support

To check if the secure storage can be used, call the `isSupported` function. It returns `true` if
the SDK is [initialized](../initializing.md) and the Telegram client supports the secure storage.

```ts
import { secureStorage } from '@tma.js/sdk';

secureStorage.isSupported(); // boolean
```

## Errors

All methods of the component throw `NotInitializedError` if the SDK is not initialized, and
`MethodUnsupportedError` if the secure storage is unsupported. The component doesn't need to be
mounted.

Each method has a safe version with the `safe` prefix, for example, `safeGetItem`. Instead of
throwing, it returns a result with one of the following errors (the `SecureStorageError` type):

- `SecureStorageMethodError`: the Telegram client failed to perform the operation. The error
  code sent by the client is available in `error.data.error`;
- `TimeoutError`: the Telegram client didn't respond in time.

Throwing versions throw these errors.

```ts
import { SecureStorageMethodError } from '@tma.js/sdk';

const result = await secureStorage.safeSetItem('token', 'abc');
if (!result.ok && SecureStorageMethodError.is(result.error)) {
  console.error('Failed:', result.error.data.error);
}
```

All methods accept an optional object with the `timeout` and `signal` properties as the last
argument. When the signal is aborted, the promise is rejected with `signal.reason`.

```ts
await secureStorage.getItem('token', { timeout: 5000 });
```

## Setting Items

To save a value, use the `setItem` method. Passing `null` as the value removes the key.

```ts
await secureStorage.setItem('token', 'abc');
```

## Getting Items

To get the value of a key, use the `getItem` method. It returns an object (`SecureStorageItem`)
with the following properties:

- `value: string | null`: value of the key, or `null` if it is missing;
- `canRestore: boolean`: true if the value is missing, but can be restored from the iCloud
  backup. Available on iOS only.

```ts
const { value, canRestore } = await secureStorage.getItem('token');
```

## Restoring Items

If the value is missing, but `canRestore` is `true`, restore it from the iCloud backup with the
`restoreItem` method. The user is asked to confirm it. The method returns the restored value, or
`null` if it is missing.

```ts
const { value, canRestore } = await secureStorage.getItem('token');
if (value === null && canRestore) {
  const restored = await secureStorage.restoreItem('token');
}
```

## Deleting Items

To delete a key, use the `deleteItem` method.

```ts
await secureStorage.deleteItem('token');
```

## Clearing

To delete all keys, use the `clear` method.

```ts
await secureStorage.clear();
```
