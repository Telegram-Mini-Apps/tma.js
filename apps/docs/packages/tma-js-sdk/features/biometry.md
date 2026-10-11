# 💠Biometry

A component responsible for the Telegram Mini Apps biometric authentication. Biometry is
supported since Mini Apps v7.2.

## Checking Support

To check if biometry can be used, call the `isSupported` function. It returns `true` if the SDK
is [initialized](../initializing.md) and the Telegram client supports biometry.

```ts
import { biometry } from '@tma.js/sdk';

biometry.isSupported(); // boolean
```

Note that a supported Telegram client may run on a device without biometry. To check if
biometry is available on the current device, mount the component and use the `isAvailable`
computed value.

## Errors

All methods of the component throw:

- `NotInitializedError` if the SDK is not initialized;
- `MethodUnsupportedError` if biometry is unsupported.

Methods requiring the component to be mounted throw `NotMountedError`.

`authenticate`, `requestAccess`, `updateToken` and their safe versions throw
`ConcurrentCallError` if another of these requests is in progress. The Telegram client responses
to concurrent requests can't be distinguished, so only one request is allowed at a time.

## Mounting

Before using the component, it must be mounted. Mounting is asynchronous, as the biometry state
is requested from the Telegram client. If the page was reloaded, the state saved before the
reload is restored instead.

While mounting, the `isMounting` computed value is `true`. When the component is mounted,
`isMounted` becomes `true`.

```ts
const promise = biometry.mount();
biometry.isMounting(); // true
await promise;
biometry.isMounting(); // false
biometry.isMounted(); // true
```

`mount` accepts an optional object with the `timeout` and `signal` properties. If the Telegram
client didn't respond in time, `mount` throws `TimeoutError`. If the signal was aborted, the
promise is rejected with `signal.reason`.

```ts
await biometry.mount({ timeout: 5000 });
```

The `safeMount` method doesn't throw `TimeoutError`, but returns it as a result:

```ts
const result = await biometry.safeMount({ timeout: 5000 });
if (!result.ok) {
  console.error('Biometry mount failed:', result.error); // TimeoutError
}
```

To unmount the component, use the `unmount` method. It also cancels pending mounts, so they don't
mount the component when they complete.

```ts
biometry.unmount();
biometry.isMounted(); // false
```

While mounted, the component listens to the `biometry_info_received` event and keeps its state up
to date.

## State

The component state is available via the `state` computed value. It contains the following
properties:

| Property          | Type      | Description                                                    |
|-------------------|-----------|----------------------------------------------------------------|
| `available`       | `boolean` | True if biometry is available on the current device.           |
| `accessRequested` | `boolean` | True if the permission to use biometry was requested.          |
| `accessGranted`   | `boolean` | True if the permission to use biometry was granted.            |
| `deviceId`        | `string`  | Unique device identifier. Use it to match the token to device. |
| `tokenSaved`      | `boolean` | True if a token is saved in the device storage.                |
| `type`            | `string`  | Biometry type: `finger`, `face` or `unknown`.                  |

The `available` property is also available via the `isAvailable` computed value.

```ts
biometry.state();
// {
//   available: true,
//   accessRequested: true,
//   accessGranted: true,
//   deviceId: 'abc',
//   tokenSaved: false,
//   type: 'face',
// }

biometry.isAvailable(); // true
```

## Requesting Access

To request the permission to use biometry, use the `requestAccess` method. It requires the
component to be mounted, and returns `true` if the permission was granted. The method updates
the component state.

It accepts an optional object with the following properties:

- `reason?: string`: text displayed to the user, 0-128 characters;
- `timeout?: number` and `signal?: AbortSignal`.

```ts
const granted = await biometry.requestAccess({ reason: 'Allow biometry to log in faster' });
```

The method throws `BiometryUnavailableError` if biometry is unavailable on the device, and
`TimeoutError` if the user didn't respond in time. `safeRequestAccess` returns these errors as a
result instead.

```ts
const result = await biometry.safeRequestAccess();
if (result.ok) {
  console.log('Access granted:', result.data);
} else {
  console.error(result.error); // BiometryUnavailableError | TimeoutError
}
```

## Authenticating

To authenticate the user and retrieve the token saved earlier, use the `authenticate` method. It
requires the component to be mounted and accepts the same options as `requestAccess`.

The method returns an object with the `status` (`'authorized'` or `'failed'`) and `token`
properties. The token is returned only if the user was authorized.

```ts
const { status, token } = await biometry.authenticate({
  reason: 'Confirm the payment',
});

if (status === 'authorized') {
  console.log(`Authorized. Token: ${token}`);
} else {
  console.log('Not authorized');
}
```

The method throws `BiometryUnavailableError` if biometry is unavailable on the device, and
`TimeoutError` if the user didn't respond in time. `safeAuthenticate` returns these errors as a
result instead.

## Updating Token

To update the token saved in the device storage, use the `updateToken` method. It requires the
component to be mounted, and accepts an optional object with the following properties:

- `token?: string`: token to save, 0-1024 characters. Omit it or pass an empty string to remove
  the token;
- `reason?: string`: text displayed to the user, 0-128 characters;
- `timeout?: number` and `signal?: AbortSignal`.

The method returns the update status: `'updated'`, `'removed'` or `'failed'`. On success, it
updates the `tokenSaved` state property.

```ts
const status = await biometry.updateToken({
  reason: 'Save the token',
  token: 'my-token',
});

await biometry.updateToken({ reason: 'Remove the token' });
```

The method throws `TimeoutError` if the user didn't respond in time. `safeUpdateToken` returns
it as a result instead.

## Opening Settings

To open the biometry settings, use the `openSettings` method. Use it when the user denied the
access, but the mini app needs it. Call it only in response to the user interaction. The method
doesn't require the component to be mounted.

```ts
biometry.openSettings();
```
