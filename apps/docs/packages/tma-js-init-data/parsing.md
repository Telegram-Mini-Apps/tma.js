# Parsing

To parse a value as init data, use the `parse` function. It accepts init data presented as
a `string` or `URLSearchParams` and returns the `InitData` object.

::: warning

`parse` doesn't check the init data signature. Never trust parsed init data received from
a client. To check the signature and get parsed init data at once,
use [`validate`](./validating.md).

:::

```ts
import { parse } from '@tma.js/init-data';

const initData = parse(
  'query_id=AAHdF6IQAAAAAN0XohDhrOrc' +
  '&user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%7D' +
  '&auth_date=1662771648' +
  '&hash=c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2',
);
// {
//   auth_date: Date(2022-09-10T01:00:48.000Z),
//   hash: 'c501b71e775f74ce10e377dea85a7ea24ecd640b223ea86dfe453e0eaed2e2b2',
//   query_id: 'AAHdF6IQAAAAAN0XohDhrOrc',
//   user: {
//     first_name: 'Vladislav',
//     id: 279058397,
//     is_premium: true,
//     language_code: 'ru',
//     last_name: 'Kibenko',
//     username: 'vdkfrost',
//   },
// }
```

If the value doesn't represent valid init data, the function throws `InvalidInitDataError`. Its
`data.value` property contains the passed value, and `cause` contains the
[valibot](https://valibot.dev) error describing what is wrong.

To get the error instead of throwing it, use `safeParse`:

```ts
import { safeParse } from '@tma.js/init-data';

const result = safeParse('...');
if (result.ok) {
  console.log('Parsed init data:', result.data);
} else {
  console.error('Init data is invalid:', result.error.cause);
}
```

## Parsed Data

The `InitData` type describes the parsed init data. Its structure follows the format Telegram
uses, which is described in the [platform documentation](../../platform/init-data.md#parameters-list).

Parsing works as follows:

- Keys are kept as Telegram sends them, in the snake case (`auth_date`, `start_param`, etc.).
- `auth_date` is converted to `Date`.
- `can_send_after` is converted to `number`.
- `user`, `receiver` and `chat` are parsed from JSON to objects.
- `auth_date` and `hash` are required. `signature` and all other parameters are optional.
- Unknown parameters, as well as unknown properties of `user`, `receiver` and `chat`, are removed
  from the result.
- If a parameter is repeated, its first value is used.

## Serializing

To convert init data back to the query format, use the `serialize` function. It accepts partial
init data and skips properties equal to `undefined`:

```ts
import { serialize } from '@tma.js/init-data';

serialize({
  auth_date: new Date(1000),
  user: { id: 1, first_name: 'Pavel' },
});
// 'auth_date=1&user=%7B%22id%22%3A1%2C%22first_name%22%3A%22Pavel%22%7D'
```

::: tip

`serialize` doesn't sign the result. To create signed init data, use [`sign`](./signing.md).

:::
