# 💠Cloud Storage

A component responsible for the bot cloud storage in Telegram Mini Apps. Each user has their own
storage of up to 1024 keys. The cloud storage is supported since Mini Apps v6.9.

::: tip
To store data on the user's device, use [Device Storage](device-storage.md). To store sensitive
data like tokens, use [Secure Storage](secure-storage.md).
:::

## Checking Support

To check if the cloud storage can be used, call the `isSupported` function. It returns `true` if
the SDK is [initialized](../initializing.md) and the Telegram client supports the cloud storage.

```ts
import { cloudStorage } from '@tma.js/sdk';

cloudStorage.isSupported(); // boolean
```

## Errors

All methods of the component throw `NotInitializedError` if the SDK is not initialized, and
`MethodUnsupportedError` if the cloud storage is unsupported. The component doesn't need to be
mounted.

Each method has a safe version with the `safe` prefix, for example, `safeGetItem`. Instead of
throwing, it returns a result with one of the following errors (the `CloudStorageError` type):

- `InvokeCustomMethodFailedError`: the Telegram client failed to perform the operation;
- `TimeoutError`: the Telegram client didn't respond in time;
- `InvalidResponseError`: the Telegram client responded with an unexpected value.

Throwing versions throw these errors.

```ts
const result = await cloudStorage.safeGetItem('a');
if (result.ok) {
  console.log(result.data);
} else {
  console.error(result.error); // CloudStorageError
}
```

All methods accept an optional object with the `timeout` and `signal` properties as the last
argument. When the signal is aborted, the promise is rejected with `signal.reason`.

```ts
await cloudStorage.getKeys({ timeout: 5000 });
```

## Setting Items

To save a value, use the `setItem` method. The key must contain 1-128 characters, only `A-Z`,
`a-z`, `0-9`, `_` and `-` are allowed. The value must contain 0-4096 characters.

```ts
await cloudStorage.setItem('a', 'a-value');
```

## Getting Keys

To retrieve all keys of the storage, use the `getKeys` method.

```ts
const keys = await cloudStorage.getKeys(); // ['a', 'b', 'c']
```

## Getting Items

To get the value of a single key, use the `getItem` method. To get values of several keys, use
the `getItems` method. Missing keys have empty strings as values.

```ts
const nonExistent = await cloudStorage.getItem('non-existent');
// ''

const existent = await cloudStorage.getItem('a');
// 'a-value'

const values = await cloudStorage.getItems(['a', 'b', 'non-existent']);
// {
//   a: 'a-value',
//   b: 'b-value',
//   'non-existent': '',
// }
```

## Deleting Items

To delete a key or a list of keys, use the `deleteItem` method.

```ts
await cloudStorage.deleteItem('a');
await cloudStorage.deleteItem(['a', 'b', 'c']);
```

## Clearing

To delete all keys, use the `clear` method. It retrieves the list of keys and then deletes them.

```ts
await cloudStorage.clear();
```
