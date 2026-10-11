# ⚙️Privacy

Functions requesting the user's personal data and permissions. All of them are supported since
Mini Apps v6.9 and have the `isSupported` function, returning `true` if the SDK is
[initialized](../initializing.md) and the Telegram client supports the function.

All functions accept an optional object with the `timeout` and `signal` properties. If the signal
was aborted, the returned promise is rejected with `signal.reason`.

## `requestPhoneAccess`

To request the user's phone number, use the `requestPhoneAccess` function. If the user agrees, the
bot receives a message with the contact. To get the contact in the mini app, use
[requestContact](#requestcontact).

The function resolves with the request status: `sent` if the user shared the phone number,
`cancelled` if the user refused, or another string reported by the Telegram client.

```ts
import { requestPhoneAccess } from '@tma.js/sdk';

if (requestPhoneAccess.isSupported()) {
  const status = await requestPhoneAccess(); // 'sent' | 'cancelled' | string
}
```

The promise is rejected with:

- `NotInitializedError` if the SDK is not initialized;
- `MethodUnsupportedError` if the function is unsupported;
- `TimeoutError` if the user didn't respond in time.

The `safeRequestPhoneAccess` function returns `TimeoutError` as a result instead of throwing it.

## `requestWriteAccess`

To request the permission for the bot to send messages to the user, use the `requestWriteAccess`
function. It resolves with the request status: `allowed` if the user granted the permission, or
another string reported by the Telegram client.

```ts
import { requestWriteAccess } from '@tma.js/sdk';

const status = await requestWriteAccess(); // 'allowed' | string
```

The function fails with the same errors as [requestPhoneAccess](#requestphoneaccess). The
`safeRequestWriteAccess` function returns `TimeoutError` as a result instead of throwing it.

## `requestContact`

To get the user's contact, use the `requestContact` function. If the user shared the contact
earlier, it is returned immediately. Otherwise, the user is asked to share it, and the function
waits until the contact reaches the Telegram server.

```ts
import { requestContact } from '@tma.js/sdk';

const contact = await requestContact({ timeout: 30_000 });
// {
//   contact: {
//     user_id: 1,
//     phone_number: '+987654321',
//     first_name: 'Vladislav',
//     last_name: 'Kibenko',
//   },
//   auth_date: Date,
//   hash: 'abcdefgh',
// }
```

The `timeout` option applies to the whole operation.

> [!WARNING]
> If no timeout is passed and the user shared the phone number, the function waits for the
> contact indefinitely. Pass a timeout to limit the waiting time.

The promise is rejected with:

- `NotInitializedError` if the SDK is not initialized;
- `MethodUnsupportedError` if the function is unsupported;
- `AccessDeniedError` if the user refused to share the contact;
- `TimeoutError` if the contact was not received in time;
- `InvalidResponseError` if the Telegram client returned an invalid contact.

The `safeRequestContact` function returns `AccessDeniedError`, `TimeoutError` and
`InvalidResponseError` (the `RequestContactError` type) as a result instead of throwing them:

```ts
import { safeRequestContact } from '@tma.js/sdk';

const result = await safeRequestContact({ timeout: 30_000 });
if (result.ok) {
  console.log('Phone number:', result.data.contact.phone_number);
} else {
  console.error('Failed to get the contact:', result.error);
}
```

## `requestContactComplete`

This function works the same way as [requestContact](#requestcontact), but resolves with both the
parsed contact and its raw representation received from the Telegram client. Pass the raw value to
your server to validate the contact using the bot token, the same way as
[init data](../../../platform/init-data.md).

```ts
import { requestContactComplete } from '@tma.js/sdk';

const { raw, parsed } = await requestContactComplete({ timeout: 30_000 });
// raw: 'contact=...&auth_date=...&hash=...'
// parsed: { contact: { ... }, auth_date: Date, hash: '...' }
```

The `safeRequestContactComplete` function returns errors as a result, the same way as
`safeRequestContact`.
