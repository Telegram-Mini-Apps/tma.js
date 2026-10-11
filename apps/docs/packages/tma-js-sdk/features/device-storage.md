# 💠Device Storage

A component responsible for the persistent local storage on the user's device. It is similar to
the browser `localStorage`, but the data is stored by the Telegram client. The device storage is
supported since Mini Apps v9.0.

::: tip
To store sensitive data like tokens, use [Secure Storage](secure-storage.md). To store data in
the cloud, so it is available on all user devices, use [Cloud Storage](cloud-storage.md).
:::

## Checking Support

To check if the device storage can be used, call the `isSupported` function. It returns `true` if
the SDK is [initialized](../initializing.md) and the Telegram client supports the device storage.

```ts
import { deviceStorage } from '@tma.js/sdk';

deviceStorage.isSupported(); // boolean
```

## Errors

All methods of the component throw `NotInitializedError` if the SDK is not initialized, and
`MethodUnsupportedError` if the device storage is unsupported. The component doesn't need to be
mounted.

Each method has a safe version with the `safe` prefix, for example, `safeGetItem`. Instead of
throwing, it returns a result with one of the following errors (the `DeviceStorageError` type):

- `DeviceStorageMethodError`: the Telegram client failed to perform the operation. The error
  code sent by the client is available in `error.data.error`;
- `TimeoutError`: the Telegram client didn't respond in time.

Throwing versions throw these errors.

```ts
import { DeviceStorageMethodError } from '@tma.js/sdk';

const result = await deviceStorage.safeGetItem('a');
if (result.ok) {
  console.log(result.data);
} else if (DeviceStorageMethodError.is(result.error)) {
  console.error('Failed:', result.error.data.error);
}
```

All methods accept an optional object with the `timeout` and `signal` properties as the last
argument. When the signal is aborted, the promise is rejected with `signal.reason`.

```ts
await deviceStorage.getItem('a', { timeout: 5000 });
```

## Setting Items

To save a value, use the `setItem` method. Passing `null` as the value removes the key.

```ts
await deviceStorage.setItem('a', 'a-value');
```

## Getting Items

To get the value of a key, use the `getItem` method. It returns `null` if the key is missing.

```ts
await deviceStorage.getItem('a'); // 'a-value'
await deviceStorage.getItem('non-existent'); // null
```

## Deleting Items

To delete a key, use the `deleteItem` method.

```ts
await deviceStorage.deleteItem('a');
```

## Clearing

To delete all keys, use the `clear` method.

```ts
await deviceStorage.clear();
```
