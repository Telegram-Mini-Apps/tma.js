# @tma.js/init-data

## 4.0.0-rc.0

### Major Changes

- 6d4952e: Replace the deprecated frontend package with a rewrite of `@tma.js/init-data-node`.

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

## 0.2.22

### Patch Changes

- Updated dependencies [b8e9f9d]
  - @tma.js/parsing@1.0.1

## 0.2.21

### Patch Changes

- 92848a6: - Specify parsers type names
- Updated dependencies [44ed697]
- Updated dependencies [6b97921]
  - @tma.js/parsing@1.0.0

## 0.2.20

### Patch Changes

- 6469933: Actualize links and comments
- Updated dependencies [6469933]
  - @tma.js/parsing@0.1.3

## 0.2.19

### Patch Changes

- f39bb65: Implement "serialize" function in launch-params, theme-params and init-data packages. Refactor packages code and tests. Fix a bug related to launch params session storage save

## 0.2.18

### Patch Changes

- 3171451: Build packages in IIFE format
- Updated dependencies [3171451]
  - @tma.js/parsing@0.1.2

## 0.2.17

### Patch Changes

- 3eafb45: Update package.json and fix entries for different modules.
- Updated dependencies [3eafb45]
  - @tma.js/parsing@0.1.1

## 0.2.16

### Patch Changes

- 8ef4f81: Add chatType and chatInstance properties. Fix type of canSendAfter property
- Updated dependencies [bfbde56]
  - @tma.js/parsing@0.1.0

## 0.2.15

### Patch Changes

- 3c6ed39: - Start using Vite instead of pure Rollup
  - Update all package.json files in all packages
  - Implement `build-utils` package to share build utilities across all packages
  - Refactor tsconfig.json files
  - Complicate examples for React and SDK
- Updated dependencies [3c6ed39]
  - @tma.js/parsing@0.0.3

## 0.2.14

### Patch Changes

- 21c4632: Update docs URLs. Rename packages to @tma.js. Update deps
- Updated dependencies [21c4632]
  - @tma.js/parsing@0.0.2

## 0.2.13

### Patch Changes

- e947423: Update readme

## 0.2.12

### Patch Changes

- 665dcf4: Switch to new package parsing utilities
- Updated dependencies [251c527]
  - @twa.js/parsing@0.0.1

## 0.2.11

### Patch Changes

- Updated dependencies [2ba1d95]
  - @twa.js/utils@0.5.0

## 0.2.10

### Patch Changes

- Updated dependencies [3c6bc51]
  - @twa.js/utils@0.4.0

## 0.2.9

### Patch Changes

- Updated dependencies [5868e9f]
  - @twa.js/utils@0.3.0

## 0.2.8

### Patch Changes

- 054d616: Fully rework bridge and release its first major update. Rename utilities in utils package. Make sdk components way better.
- Updated dependencies [054d616]
  - @twa.js/utils@0.2.12

## 0.2.7

### Patch Changes

- 0f69488: Add exports property in package json.
- Updated dependencies [0f69488]
  - @twa.js/utils@0.2.11

## 0.2.6

### Patch Changes

- 5879578: Add src folder to package. Also, inline source typescript source code.

## 0.2.5

### Patch Changes

- Updated dependencies [aeed89d]
  - @twa.js/utils@0.2.10

## 0.2.4

### Patch Changes

- a103e42: Optimize imports, fix minor bugs.
- Updated dependencies [a103e42]
  - @twa.js/utils@0.2.9
