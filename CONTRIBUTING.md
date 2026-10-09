# Contribution Guidelines

Contributing to the development of libraries related to the Telegram Mini Apps platform is not
difficult. We have a limited set of TypeScript packages and a bunch of scripts that will be useful
during development. Before starting to contribute, it is better to discuss any proposed changes with
the project owners via repository issues to avoid duplication of effort.

## Cloning Repository

First of all, it is required to fetch the repository code (or its forked version). To do this, you
can clone the repository using the Git command:

```bash
# Via SSH.
git clone git@github.com:Telegram-Mini-Apps/tma.js.git
```

or

```bash
# Via HTTPS.
git clone https://github.com/Telegram-Mini-Apps/tma.js.git
```

Once the repository is fetched, install project dependencies via [pnpm](https://pnpm.io/) (pnpm
only, as long as the current repository is a pnpm monorepo):

```bash
pnpm i
```

## Project Goal

The main goal of `@tma.js` is to be a better alternative to the official Telegram Mini Apps SDK,
[telegram-web-app.js](https://telegram.org/js/telegram-web-app.js) (see the
[motivation](./MOTIVATION.md)). When adding or changing platform functionality, check how the
official SDK implements it to keep feature parity, and aim to do better in typing, ergonomics and
reliability.

The official platform documentation is published
at [core.telegram.org/bots/webapps](https://core.telegram.org/bots/webapps). Together with the
official SDK's source code, treat it as the source of truth for how Mini Apps methods and events
work and should behave.

## Documentation

The documentation located in the [apps/docs](./apps/docs) directory is published
at [docs.telegram-mini-apps.com](https://docs.telegram-mini-apps.com/). If your changes affect the
public API or the platform description, update the related documentation pages as well.

## Philosophy

Before diving deep into the code, it's important to understand the philosophy behind our repositories' development.

The first thing to know here is we don't really like handling errors using `try-catch` construction.
This approach often requires you to read the source code of a function to know what specific errors it might throw,
and TypeScript doesn't check thrown errors at all. Instead, functions return their expected errors as a `Result`,
so the compiler knows exactly how a function can fail:

```typescript
type Result<T, E> = { ok: true; data: T } | { ok: false; error: E };
```

However, we recognize that many developers may be more comfortable with a traditional `try-catch` approach. To
accommodate this, a function failing with expected errors must have two versions:

- `safeX` returning a `Result`. This is the main implementation;
- `x` unwrapping the result and throwing its error. It has no logic of its own.

Follow these rules:

- Errors are classes created with [error-kid](https://www.npmjs.com/package/error-kid), so users can handle each
  of them with `matchError` and get a compilation error when one is left unhandled.
- Only expected errors go to `Result`: invalid input, a timeout, a failed operation. Environment and usage errors,
  like calling a method outside Telegram or calling an unsupported method, are thrown.
- Internal functions return `Result` too, instead of throwing and catching. This way the compiler checks that
  the error type of the safe version matches its implementation. Never cast the caught error to the expected type.
- Document errors with `@returns` in the safe version and with `@throws` in the throwing one, and cover the error
  types with type tests.

Here is an example:

```typescript
import { errorClass } from 'error-kid';

import { err, ok, type Result, unwrap } from './result.js';

export class NotFoundError extends errorClass({ name: 'NotFoundError', message: 'Not found' }) {
}

/**
 * @returns The value, or `NotFoundError` if it is missing.
 */
export function safeGetValue(key: string): Result<string, NotFoundError> {
  const value = storage.get(key);
  return value === undefined ? err(new NotFoundError()) : ok(value);
}

/**
 * Throwing version of `safeGetValue`.
 * @throws {NotFoundError} The value is missing.
 */
export function getValue(key: string): string {
  return unwrap(safeGetValue(key));
}
```

The second and final principle is **the simpler, the better**. We strive to write code that is as understandable and
intuitive as possible. Please think twice before implementing a complex solution.

## Trying Your Code

This project contains an already configured application that can use any `@tma.js` package located
in the [packages](packages) folder. The application uses local versions of packages, not remote ones
presented in some registry. The local playground represents almost the default Vite TypeScript
application template with some additional tsconfig configuration, allowing the resolution of
packages from the corresponding folder.

To run the local playground, use the following commands:

```bash
# Build packages as long as the playground may 
# the built versions.
pnpm run packages:build

# Go to the application folder.
cd apps/local-playground

# Run Vite dev server.
pnpm run dev
```

This will make Vite start the development server using the `index.html` file placed in the
application directory. In turn, this HTML file refers to the `index.ts` file that will be
automatically transpiled by Vite and executed by the browser.

As the local playground refers to the actual code, you can make any changes in the packages
directory to see the changes instantly. This will help you understand how the code you are going to
change in `@tma.js` packages will work after your proposed changes.

## After Changes Done

When you are done with making changes, it is required to write tests related to the changes. For
this purpose, we use [Vitest](https://vitest.dev/). Then, we should check if the repository status
is correct.

Here is the list of commands you have to run:

```bash
# Run tests.
pnpm run packages:test

# Run eslint.
pnpm run packages:lint
# Or if you want to automatically fix problems:
pnpm run packages:lint:fix

# Check if packages are building successfully.
pnpm run packages:build
```

If all steps above were completed successfully and proposed changes require bumping some packages'
versions, you have to describe changes using the `changeset` command:

```bash
changeset
```

You can learn more about Changeset [here](.changeset/README.md).

When changes are described (if required), don't forget to create a Pull Request and wait for the
project owners to review it.