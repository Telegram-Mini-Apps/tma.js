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
This approach often requires you to read the source code of a function to know what specific errors it might throw.
Instead, we use the `Either` abstraction from [fp-ts](https://www.npmjs.com/package/fp-ts). This provides a clear and
explicit way to see whether a function executed successfully or failed.

However, we recognize that many developers may be more comfortable with a traditional `try-catch` approach. To
accommodate this, all functions that can fail must return an `Either`. Additionally, you must provide a "throwing"
alternative that wraps the `Either` and throws the error for those who prefer that style.

When writing your code, ensure that if a function can throw an error, it always returns an `Either` and has a throwing
counterpart.

Here is an example:

```typescript
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

class MyError extends Error {
}

function nonThrowing(): E.Either<MyError, string> {
  return Math.random() < 0.5
    ? E.left(new MyError())
    : E.right('just some string');
}

function throwing(): string {
  return pipe(nonThrowing(), E.match(
    e => {
      throw e;
    },
    result => result
  ))
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