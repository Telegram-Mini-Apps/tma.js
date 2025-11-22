# @tma.js/sdk

## 3.1.1

### Patch Changes

- 2ff218a: Save raw colors instead of computed ones when calling MiniApp's color setters.

## 3.1.0

### Minor Changes

- 6b6218d: Implement `DeviceStorage` and `SecureStorage`.

### Patch Changes

- Updated dependencies [6fc38d4]
- Updated dependencies [a5333d9]
  - @tma.js/bridge@2.2.0

## 3.0.8

### Patch Changes

- 7ab459c: Set `SwipeBehavior.isVerticalEnabled` initial value as true.

## 3.0.7

### Patch Changes

- Updated dependencies [9b46673]
  - @tma.js/bridge@2.1.3

## 3.0.6

### Patch Changes

- bd78481: - fix(MiniApp): apply state changes when calling `setHeaderColor` method
  - fix(MiniApp): fix improper logic updating colors when theme changes

## 3.0.5

### Patch Changes

- 95ae14e: Don't use values from theme params when mounting MiniApp. Also, don't call setters when the component mounted

## 3.0.4

### Patch Changes

- c6d9303: Make `ifAvailable` always return `O.Option<AnyEither>` instead of `O.Option<Plain>`

## 3.0.3

### Patch Changes

- Updated dependencies [458cd03]
  - @tma.js/bridge@2.1.2

## 3.0.2

### Patch Changes

- 58793e3: Re-export `emitEvent` from `@tma.js/bridge`.

## 3.0.1

### Patch Changes

- 4570643: Update package.json actualizing all paths.
- Updated dependencies [4570643]
  - @tma.js/transformers@1.1.1
  - @tma.js/signals@1.0.1
  - @tma.js/toolkit@1.0.2
  - @tma.js/bridge@2.1.1
  - @tma.js/types@1.0.2
