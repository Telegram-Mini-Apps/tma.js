---
"@tma.js/init-data": major
---

Replace the deprecated frontend package with a rewrite of `@tma.js/init-data-node`.

- The code uses only WebCrypto, without `node:crypto` and `Buffer`. It works in Node 20+, Bun, Deno and Cloudflare Workers. There is a single entry point, the `./web` subpath of `@tma.js/init-data-node` is gone.
- Everything is async. `validate`, `validate3rd` → `Promise<InitData>` returning the parsed data, `isValid` → `Promise<boolean>`, `hashToken` → `Promise<string>` (hex).
- Remove `fp-ts`: `parseFp`, `validateFp`, `validate3rdFp` → `safeParse`, `safeValidate`, `safeValidate3rd`. Remove `isValidFp`, `isValid3rdFp`, `signFp`, `signDataFp`.
- `sign(data, token, authDate, options?)` → `sign(data, secret)`, `auth_date` is passed in `data` and defaults to `new Date()`. `signature` is added only if passed. `signData` accepts only a string.
- Add `createSecretKey(token | hash, { hashed? })` → `CryptoKey`, which replaces the `tokenHashed` option. Every function accepting a token accepts a `Secret = string | CryptoKey`.
- Add `serialize(Partial<InitData>)`.
- `parse` throws `InvalidInitDataError` with `ValiError` in `cause`.
- HMAC is compared in constant time. `isValid3rd` rejects on WebCrypto errors instead of returning `false`.
- The `InitData` schema: `signature` is optional, `chat_join_request_query_id` is added, unknown keys are stripped, the first value is taken for repeated keys.
- `SignatureMissingError` takes `'hash' | 'signature'` (`.data.param`), `ExpiredError` has `.data.now`. `HexStringLengthInvalidError` is removed, `createSecretKey` throws `TypeError`.
- Remove `deepSnakeToCamelObjKeys` and the `timeout` / `abortSignal` options.
- Add an IIFE build with the `tmajs.initData` global.
