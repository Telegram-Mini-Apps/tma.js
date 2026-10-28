# @tma.js/sdk-svelte

## 4.0.0-rc.1

### Patch Changes

- f65a764: Freeze objects and arrays returned by computed values, so mutating them no longer silently changes the component state. `Computed<T>` and `useComputed` return `DeepReadonly<T>`, which is exported from `@tma.js/sdk`.
- Updated dependencies [f65a764]
- Updated dependencies [f65a764]
  - @tma.js/sdk@4.0.0-rc.1

## 4.0.0-rc.0

### Major Changes

- 6d4952e: Move to `@tma.js/sdk` v4, see its changelog for the SDK changes. Replace `useSignal(signal)` with `useComputed(computed)`, which accepts only a `Computed` from the SDK.

  Move `@tma.js/sdk` from `dependencies` to `peerDependencies`, install it next to the binding. This guarantees a single copy of the SDK, whose components are singletons with their own state.

  - React: `useComputed` is built on `useSyncExternalStore`. Remove the `camelCase` argument of `useLaunchParams()`, it returns `LaunchParams` with a raw `tgWebAppData` string. Drop React 17 support, the peer dependency is `^18 || ^19`.
  - Vue: returns `Readonly<Ref<T>>` built on `shallowRef` and works in any effect scope. The peer dependency is `vue ^3.2`.
  - Solid: works outside components. Function values are no longer treated as updaters.
  - Svelte: returns a `Readable` instead of a `Writable`, subscribes lazily and works anywhere. The peer dependency is `svelte ^3 || ^4 || ^5`.

### Patch Changes

- Updated dependencies [6d4952e]
  - @tma.js/sdk@4.0.0-rc.0

## 1.0.24

### Patch Changes

- Updated dependencies [d48041d]
- Updated dependencies [93317ef]
  - @tma.js/sdk@3.4.0

## 1.0.23

### Patch Changes

- Updated dependencies [f61770a]
  - @tma.js/sdk@3.3.0

## 1.0.22

### Patch Changes

- @tma.js/sdk@3.2.3

## 1.0.21

### Patch Changes

- @tma.js/sdk@3.2.2

## 1.0.20

### Patch Changes

- Updated dependencies [b6b3243]
  - @tma.js/sdk@3.2.1

## 1.0.19

### Patch Changes

- Updated dependencies [2d24b83]
  - @tma.js/sdk@3.2.0

## 1.0.18

### Patch Changes

- @tma.js/sdk@3.1.9

## 1.0.17

### Patch Changes

- Updated dependencies [e9ea686]
  - @tma.js/sdk@3.1.8

## 1.0.16

### Patch Changes

- Updated dependencies [8ecc358]
  - @tma.js/sdk@3.1.7

## 1.0.15

### Patch Changes

- Updated dependencies [ae53859]
  - @tma.js/sdk@3.1.6

## 1.0.14

### Patch Changes

- Updated dependencies [805c0fa]
  - @tma.js/sdk@3.1.5

## 1.0.13

### Patch Changes

- Updated dependencies [3f233d2]
  - @tma.js/sdk@3.1.4

## 1.0.12

### Patch Changes

- Updated dependencies [22eed1e]
  - @tma.js/sdk@3.1.3

## 1.0.11

### Patch Changes

- Updated dependencies [8199706]
  - @tma.js/sdk@3.1.2

## 1.0.10

### Patch Changes

- Updated dependencies [2ff218a]
  - @tma.js/sdk@3.1.1

## 1.0.9

### Patch Changes

- Updated dependencies [6b6218d]
  - @tma.js/sdk@3.1.0

## 1.0.8

### Patch Changes

- Updated dependencies [7ab459c]
  - @tma.js/sdk@3.0.8

## 1.0.7

### Patch Changes

- @tma.js/sdk@3.0.7

## 1.0.6

### Patch Changes

- Updated dependencies [bd78481]
  - @tma.js/sdk@3.0.6

## 1.0.5

### Patch Changes

- Updated dependencies [95ae14e]
  - @tma.js/sdk@3.0.5

## 1.0.4

### Patch Changes

- Updated dependencies [c6d9303]
  - @tma.js/sdk@3.0.4

## 1.0.3

### Patch Changes

- @tma.js/sdk@3.0.3

## 1.0.2

### Patch Changes

- Updated dependencies [58793e3]
  - @tma.js/sdk@3.0.2

## 1.0.1

### Patch Changes

- 4570643: Update package.json actualizing all paths.
- Updated dependencies [4570643]
  - @tma.js/sdk@3.0.1
