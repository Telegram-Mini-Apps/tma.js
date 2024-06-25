# Init Data

This section of SDK provides utilities to work with Mini
Apps [init data](../../platform/init-data.md).

## Parsing

This library includes the function `parseInitData`, which can extract initialization data
information from query parameters. Here is an example of its usage:

```typescript
import { parseInitData } from '@telegram-apps/sdk';

// Let's imagine, we have init data in a raw format like this. Telegram application is
// sending it in the exact same format.
const initDataString =
  'query_id=AAHdF6IQAAAAAN0XohDhrOrc' +
  '&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%7D' +
  '&auth_date=1662771648' +
  '&hash=c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2';

// Extract init data.
console.log(parseInitData(initDataString));
// or
console.log(parseInitData(new URLSearchParams(initDataString)));

// Output:
// {
//   authDate: 2022-09-10T01:00:48.000Z,
//   hash: 'c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2',
//   queryId: 'AAHdF6IQAAAAAN0XohDhrOrc',
//   user: {
//     id: 279058397,
//     firstName: 'Vladislav',
//     lastName: 'Kibenko',
//     username: 'vdkfrost',
//     languageCode: 'ru',
//     isPremium: true
//   }
// }
```

The function extracts the required parameters and automatically validates their types. If a property
has an invalid type or value, it will throw an error. To learn more about returned type, refer
to [InitData](init-data/init-data.md) type page.

## Validating and Signing

Validation and signing utilities has been moved to the separate
package - [@telegram-apps/init-data-node](../telegram-apps-init-data-node).
