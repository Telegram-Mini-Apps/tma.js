# Local Playground

This application can be used by developers to test the code, written in the current monorepo.
We created this playground to avoid writing the same code from one package to another, adding
`index.html` and `vite.config.ts` files.

## Usage

1. Import any package from the `packages2` directory, e.g. `@tma.js/bridge`. Packages are resolved
   to their sources (see `compilerOptions.paths` in `tsconfig.json`), so they don't need to be
   built, and changes in them are applied immediately.
2. Run `pnpm run dev` (or `pnpm run dev:https` to use HTTPS, which is required by Telegram).
3. Open URL from the console in a browser or in Telegram.

Outside Telegram, the playground mocks the Telegram environment using `mockTelegramEnv`.
