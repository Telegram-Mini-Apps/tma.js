# 💠Cloud Storage

A component responsible for managing the cloud storage in Telegram Mini Apps.

## Checking Support

To check if the cloud storage is supported by the current Telegram Mini Apps version, the `isSupported` signal is used:

```ts
import { cloudStorage } from '@tma.js/sdk';

cloudStorage.isSupported(); // boolean
```

## Setting Items

To set a key value, use the `setItem` method.

```ts
await cloudStorage.setItem('a', 'a-value');
```

## Getting Keys

To retrieve a list of all existing keys, use the `getKeys` method.

```ts
const keys = await cloudStorage.getKeys(); // ['a', 'b', 'c']
```

## Getting Items

To get the value of a specific key or multiple keys, use the `getItem` and `getItems` methods.

```ts
const nonExistent = await cloudStorage.getItem('non-existent');
// The result is an empty string: ''

const existent = await cloudStorage.getItem('a');
// The result is the value of the 'a' key. Example: 'a-value'

const values = await cloudStorage.getItems(['a', 'b', 'non-existent']);
// The result is a record of the keys 'a', 'b', and 'non-existent'. 
// Example:
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
