# 💠Invoice

A component responsible for the
Telegram [invoices](https://core.telegram.org/bots/payments#introducing-payments-2-0).

## Checking Support

To check if invoices are supported by the current Telegram Mini Apps version, the `isSupported` signal is used:

```ts
import { invoice } from '@tma.js/sdk';

invoice.isSupported(); // boolean
```

## Opening

To open an invoice, it is required to use the `openSlug` or `openUrl` methods. These method allow opening invoices
using their URLs or slugs.

Calling the method updates the `isOpened` signal.

```ts
import { invoice } from '@tma.js/sdk';

// Opening via slug:
invoice.isOpened(); // false
const promise = invoice.openSlug('abIIks213');
invoice.isOpened(); // true
const status = await promise;
invoice.isOpened(); // false

// Opening via URL:
await invoice.openUrl('https://t.me/invoice/abIIks213');
```
