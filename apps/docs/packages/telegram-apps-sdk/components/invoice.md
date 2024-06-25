# `Invoice`

Implements Telegram [invoices](https://core.telegram.org/bots/payments#introducing-payments-2-0)
functionality.

## Initialization

To initialize the component, use the `initInvoice` function:

```typescript
import { initInvoice } from '@telegram-apps/sdk';

const [invoice] = initInvoice();  
```

## Opening Invoice

To open an invoice, it is required to use the `open` method. This method allows opening invoices
using their URLs or slugs.

Opening an invoice in URL mode requires passing the second argument equal to `url`, so the method
will interpret the passed value as a URL.

To interpret the passed value as a slug, omit the second argument.

::: code-group

```typescript [Using slug]
invoice
  .open('abIIks213')
  .then((status) => {
    // Output: 'paid'
    return console.log(status);
  });
```

```typescript [Using URL]
invoice
  .open('https://t.me/invoice/abIIks213', 'url')
  .then((status) => {
    // Output: 'paid'
    return console.log(status);
  });
```

:::

## Events

List of events, which could be [tracked](../components#events):

| Event             | Listener                   | Triggered when                 |
|-------------------|----------------------------|--------------------------------|
| `change`          | `() => void`               | Something in component changed |
| `change:isOpened` | `(value: boolean) => void` | `isOpened` property changed    |

## Methods Support

List of methods, which could be used in [support checks](../components#methods-support): `open`
