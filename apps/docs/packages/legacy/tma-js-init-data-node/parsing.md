# Parsing

To parse a value as init data, use the `parse` and `parseFp` ([functional alternative](functional-approach.md))
methods. They both accept init data presented as a `string` or `URLSearchParams`.

:::code-group

```ts [Using parse]
import { parse } from '@tma.js/init-data-node';

try {
  const initData = parse('...');
  // {
  //   hash: 'jkn1mn239hgxzkjcbkb1278',
  //   auth_date: 1757699236,
  //   user: {
  //     first_name: 'Vladislav',
  //     id: 279058397,
  //     is_premium: true,
  //     language_code: 'en',
  //     last_name: 'Kibenko',
  //     username: 'vdkfrost',
  //   },
  // }
} catch (e) {
  console.error('Something is wrong', e);
}
```

```typescript [Using parseFp (functional)]
import { parseFp } from '@tma.js/init-data-node';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

pipe(parseFp('...'), E.match(
  error => {
    // Something went wrong.
  },
  initData => {
    // Init data parsed.
  },
));
```

:::

To return a camel-cased value, use the `deepSnakeToCamelObjKeys` function:

```ts
import { parse, deepSnakeToCamelObjKeys } from '@tma.js/init-data-node';

const initData = deepSnakeToCamelObjKeys(parse('...'));
// {
//   hash: 'jkn1mn239hgxzkjcbkb1278',
//   authDate: 1757699236,
//   user: {
//     firstName: 'Vladislav',
//     id: 279058397,
//     isPremium: true,
//     languageCode: 'en',
//     lastName: 'Kibenko',
//     username: 'vdkfrost',
//   },
// }
```
