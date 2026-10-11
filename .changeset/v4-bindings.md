---
"@tma.js/sdk-react": major
"@tma.js/sdk-vue": major
"@tma.js/sdk-solid": major
"@tma.js/sdk-svelte": major
---

Move to `@tma.js/sdk` v4, see its changelog for the SDK changes. Replace `useSignal(signal)` with `useComputed(computed)`, which accepts only a `Computed` from the SDK.

- React: `useComputed` is built on `useSyncExternalStore`. Remove the `camelCase` argument of `useLaunchParams()`, it returns `LaunchParams` with a raw `tgWebAppData` string. Drop React 17 support, the peer dependency is `^18 || ^19`.
- Vue: returns `Readonly<Ref<T>>` built on `shallowRef` and works in any effect scope. The peer dependency is `vue ^3.2`.
- Solid: works outside components. Function values are no longer treated as updaters.
- Svelte: returns a `Readable` instead of a `Writable`, subscribes lazily and works anywhere. The peer dependency is `svelte ^3 || ^4 || ^5`.
