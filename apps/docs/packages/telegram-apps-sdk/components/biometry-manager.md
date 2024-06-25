# `BiometryManager`

## Initialization

To initialize the component, use the `initBiometryManager` function:

```typescript
import { initBiometryManager } from '@telegram-apps/sdk';

const [biometryManager] = initBiometryManager();  
```

::: info

Since BiometryManager can't be instantiated synchronously, this function returns a promise that will
be resolved when the biometry manager data is retrieved.

:::

## Authenticating

To authenticate a user, use the `authenticate` method:

```ts
bm
  .authenticate({ reason: 'Authorize to unlock the storage' })
  .then(token => {
    console.log('Token received', token);
  });
```

This method accepts an optional `reason: string` property with length up to 128 symbols.

## Opening Settings

To open a modal window with biometry settings, use the `openSettings` method:

```ts
bm.openSettings();
```

In this modal, a user is capable of turning on and off the biometry functionality.

## Requesting Access

To request a permission to use the biometry, use the `requestAccess` method:

```ts
bm
  .requestAccess({ reason: 'Authorize to start using biometry' })
  .then(accessGranted => {
    console.log('Access granted', accessGranted);
  });
```

As well as the `authenticate` method, it accepts an optional `reason: string` property with length
up to 128 symbols.

## Updating Biometry Token

To update a token, stored in the secure storage, use the `updateToken` method:

```ts
bm
  .updateToken({ token: 'My token' })
  .then(status => {
    console.log('Token updated', status);
  });
```

This method returns a promise with the execution status.

## Events

List of events, which could be [tracked](../components#events):

| Event                    | Listener                        | Triggered when                     |
|--------------------------|---------------------------------|------------------------------------|
| `change:accessGranted`   | `(value: boolean) => void`      | `accessGranted` property changed   |
| `change:accessRequested` | `(value: boolean) => void`      | `accessRequested` property changed |
| `change:available`       | `(value: boolean) => void`      | `available` property changed       |
| `change:deviceId`        | `(value: string) => void`       | `deviceId` property changed        |
| `change:tokenSaved`      | `(value: boolean) => void`      | `tokenSaved` property changed      |
| `change:token`           | `(value: string) => void`       | `token` property changed           |
| `change:biometryType`    | `(value: BiometryType) => void` | `biometryType` property changed    |

## Methods Support

List of methods, which could be used in [support checks](../components#methods-support):
`auth`, `openSettings`, `requestAccess` and `updateToken`.