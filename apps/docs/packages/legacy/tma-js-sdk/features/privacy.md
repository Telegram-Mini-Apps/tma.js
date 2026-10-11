# ⚙️Privacy

## `requestPhoneAccess`

To request access to a user's phone information, use the `requestPhoneAccess` method. If the user
grants access, the developer's bot will receive the phone details.

```ts
import { requestPhoneAccess } from '@tma.js/sdk';

const status = await requestPhoneAccess();
// status will be 'sent' | 'cancelled' | string
```

## `requestWriteAccess`

To request permission to send messages to the user, use the `requestWriteAccess` method.

```ts
import { requestWriteAccess } from '@tma.js/sdk';

const status = await requestWriteAccess();
// status will be 'allowed' | string
```

## `requestContact`

To retrieve a user's contact information, use the `requestContact` method.

```ts
import { requestContact } from '@tma.js/sdk';

const contact = await requestContact();
// {
//   contact: {
//     user_id: 1,
//     phone_number: '+987654321',
//     first_name: 'Vladislav',
//     last_name: 'Kibenko'
//   },
//   auth_date: Date(12345678),
//   hash: 'abcdefgh'
// };
```

## `requestContactComplete`

This function works the same as [requestContactComplete](#requestContactComplete), but it also returns a raw
representation of the contact data from the Telegram client, so its signature could be verified.

```ts
import { requestContactComplete } from '@tma.js/sdk';

const contact = await requestContactComplete();
// {
//   raw: 'contact=...&auth_date=...&hash=...',
//   contact: { ... }
// }
```