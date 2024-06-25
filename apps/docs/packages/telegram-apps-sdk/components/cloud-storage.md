# `CloudStorage`

Implements functionality related to Telegram Mini Apps cloud storage.

## Initialization

To initialize the component, use the `initCloudStorage` function:

```typescript
import { initCloudStorage } from '@telegram-apps/sdk';

const [cloudStorage] = initCloudStorage();  
```

## Setting Items

To save a value in the cloud storage, it is required to use the `set` method:

```typescript
cloudStorage
  .set('my-key', 'my-value')
  .then(() => console.log('Item saved'));
```

## Getting Items

To get values by keys, it is required to use `get` method, which acquires both single string
value and array of string values:

::: code-group

```typescript [Single value]
cloudStorage
  .get('my-key')
  .then((value) => {
    console.log(value);
    // Output: 'my-value'
  });

cloudStorage
  .get('non-existent')
  .then((value) => {
    console.log(value);
    // Output: ''
  });
```

```typescript [Array of values]
cloudStorage
  .get(['my-key', 'non-existent'])
  .then((result) => {
    console.log('Result is', result);
    // Output:
    // {
    //   'my-key': 'my-value',
    //   'non-existent': ''
    // }
  });
```

:::

This method returns empty strings for those keys, which don't exist in the cloud storage.

## Getting Keys

To retrieve all registered keys in the cloud storage, it is required to use the `getKeys` method:

```typescript
cloudStorage
  .getKeys()
  .then((keys) => {
    // Will be ['my-key'].
    console.log('Keys are', keys);
  })
```

## Deleting Items

To delete items in the cloud storage, it is required to use `delete` method. This method allows
deleting both single and multiple items:

::: code-group

```typescript [Single item]
cloudStorage
  .delete('my-key')
  .then(() => console.log('Key was deleted'));
```

```typescript [Multiple items]
cloudStorage
  .delete(['my-key', 'another-key'])
  .then(() => console.log('Keys were deleted'));
```

:::

## Methods Support

List of methods, which could be used in [support checks](../components#methods-support):
`delete`, `get`, `getKeys` and `set`
