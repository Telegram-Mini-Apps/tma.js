# 💠Biometry

A component responsible for biometry functionality for Telegram Mini Apps.

## Checking Support

To check if biometry is supported by the current Telegram Mini Apps version, use the `isSupported` signal:

```ts
import { biometry } from '@tma.js/sdk';

biometry.isSupported(); // boolean
```

## Mounting

Before using the component, it must be mounted.

This process is asynchronous, as biometry data needs to be requested from the Telegram application. The `isMounting`
signal will be set to `true` during the process and updated to `false` when complete.

If mounting is successful, the `isMounted` signal will be set to `true`.

```ts
try {
  const promise = biometry.mount();
  biometry.isMounting(); // true
  await promise;
  biometry.isMounting(); // false
  biometry.isMounted(); // true
} catch (err) {
  biometry.isMounting(); // false
  biometry.isMounted(); // false
}
```

To unmount, use the `unmount` method:

```ts
biometry.unmount();
biometry.isMounted(); // false
```

## Requesting Biometry Access

To request biometry access, use the `requestAccess` method. It returns a promise with boolean value indicating whether
access was granted by the user.

```ts
const isAccessGranted = await biometry.requestAccess(); // boolean
```

## Authenticating

To authenticate a user and retrieve a previously saved token, use the `authenticate` method.

It optionally accepts an object with the following properties:

- `reason?: string`: a reason for authentication to display to the user.

The method returns an object with `status` (`'failed'` or `'authorized'`) and, if successful, a `token: string`.

```ts
const { status, token } = await biometry.authenticate({
  reason: 'Please!',
});

if (status === 'authorized') {
  console.log(`Authorized. Token: ${token}`);
} else {
  console.log('Not authorized');
}
```

## Updating Token

To update the token stored in local secure storage, use the `updateToken` method.

The method accepts an optional object with the `reason` and `token` properties. If no token is provided, the existing
token will be deleted.

It returns a promise with boolean indicating if any changes were made.

```ts
const updated = await biometry.updateToken({
  reason: 'Want to delete',
});

await biometry.updateToken({
  reason: 'Will set a new one',
  token: 'new token',
});
```

## Opening Settings

To open the biometry-related settings modal, use the `openSettings` method. This method can only be triggered in
response to user interaction.

```ts
biometry.openSettings();
```
