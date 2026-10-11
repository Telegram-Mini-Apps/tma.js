# 💠Invoice

A component responsible for the
Telegram [invoices](https://core.telegram.org/bots/payments#introducing-payments-2-0). Invoices
are supported since Mini Apps v6.1.

## Checking Support

To check if invoices can be used, call the `isSupported` function. It returns `true` if the SDK
is [initialized](../initializing.md) and the Telegram client supports invoices.

```ts
import { invoice } from '@tma.js/sdk';

invoice.isSupported(); // boolean
```

## Opening

To open an invoice, use the `openSlug` or `openUrl` methods. They open the invoice by its slug or
URL, and wait until it is closed. The returned promise resolves with the invoice status:
`'paid'`, `'failed'`, `'pending'` or `'cancelled'`.

While the invoice is opened, the `isOpened` computed value is `true`.

```ts
// Opening by slug.
invoice.isOpened(); // false
const promise = invoice.openSlug('abIIks213');
invoice.isOpened(); // true
const status = await promise;
invoice.isOpened(); // false

// Opening by URL.
await invoice.openUrl('https://t.me/invoice/abIIks213');
```

`openUrl` accepts links with Telegram hostnames (`t.me`, `telegram.me`, `telegram.dog`) and
pathnames in the format `/invoice/{slug}` or `/${slug}`.

Both methods accept an optional object with the `timeout` and `signal` properties as the second
argument. When the signal is aborted, the promise is rejected with `signal.reason`.

```ts
const status = await invoice.openSlug('abIIks213', { timeout: 60000 });
```

## Errors

Both methods throw:

- `NotInitializedError` if the SDK is not initialized;
- `MethodUnsupportedError` if invoices are unsupported;
- `ConcurrentCallError` if an invoice is already opened;
- `TimeoutError` if the invoice was not closed in time.

`openUrl` also throws `InvalidArgumentsError` if the URL is not an invoice link.

The safe versions, `safeOpenSlug` and `safeOpenUrl`, return `TimeoutError` and
`InvalidArgumentsError` as a result instead of throwing them. Other errors are still thrown.

```ts
const result = await invoice.safeOpenUrl('https://t.me/invoice/abIIks213');
if (result.ok) {
  console.log('Invoice status:', result.data);
} else {
  console.error(result.error); // InvalidArgumentsError | TimeoutError
}
```
