# @telegram-apps/sdk

## 2.5.1

### Patch Changes

- 36d432b: Update the link, used in the `Utils.shareURL` method.

## 2.5.0

### Minor Changes

- 96bf02b: Implement utils.shareURL method.

## 2.4.0

### Minor Changes

- 149dc29: Improve `QRScanner.open()` method. Improve typings for the `request` function.

## 2.3.0

### Minor Changes

- c00529a: Implement mockTelegramEnv function.

## 2.2.0

### Minor Changes

- 3b081de: Make subscribe method more comfortable to use. Fix a bug in BiometryManager initialization. Rename MainButton background-related properties and methods.

## 2.1.0

### Minor Changes

- 175400a: Make components initializer works only on the client side. Previously, we had a logic related to SSR, but it was moved to the external packages. In this update also make BrowserNavigator hash mode equal to "classic" by default.

## 2.0.2

### Patch Changes

- 8fa7a87: Make components intialization a bit easier on the server side.

## 2.0.1

### Patch Changes

- a77d249: Fix `isTMA` incorrect behavior in native apps.

## 2.0.0

### Major Changes

- f0f5949: Completely rework the package. In this release we have focused on improving the bundle size, writing more tests, providing new navigation features and fulfilling Mini Apps functionality

## 1.5.3

### Patch Changes

- 26493b8: Fix invalid launch params serialization

## 1.5.2

### Patch Changes

- d5ca188: Fix incorrect retrieveLaunchParams function behavior in case of complete URL

## 1.5.1

### Patch Changes

- 1e43c94: Better classNames util

## 1.5.0

### Minor Changes

- 0bec0b5: Improve request function

## 1.4.9

### Patch Changes

- 896411c: Remove slow types
- 26a1c84: Get rid of barrel files

## 1.4.8

### Patch Changes

- 25ee92d: Call iframe_will_reload method on reload_iframe event

## 1.4.7

### Patch Changes

- 7a952b3: Deprecate retrieveLaunchData function

## 1.4.6

### Patch Changes

- 12a99ae: Remove src folder from package json files.

## 1.4.5

### Patch Changes

- 64e5fa1: Remove sourcemaps.

## 1.4.4

### Patch Changes

- 9792afa: Move css utils to the separate folder. Write tests. Fix a bug in viewport stable height CSS var

## 1.4.3

### Patch Changes

- 9f0a8ca: Add source = window.parent in emitEvent function. Fix types in merge class names utility

## 1.4.2

### Patch Changes

- 4d7006d: Implement parseMessage method

## 1.4.1

### Patch Changes

- 118380f: Re-export parsing utils

## 1.4.0

### Minor Changes

- c2de1d4: Implement retrieveFromUrl launch params function.

## 1.3.0

### Minor Changes

- ec65262: Replace "async" option with "complete". Increase viewport timeout and rework related flow.

## 1.2.1

### Patch Changes

- d3c14b7: Fix miniApp.requestContact data parser

## 1.2.0

### Minor Changes

- d90f521: Implemented MiniApp.requestContact method, reworked MiniApp.requestWriteAccess and MiniApp.requestPhoneAccess methods. Add invokeCustomMethod function.

## 1.1.0

### Minor Changes

- 0c7646c: Implement SettingsButton component

## 1.0.2

### Patch Changes

- f065e23: Get rid of some side effects

## 1.0.1

### Patch Changes

- e8f2cb1: Fix error catch in init function

## 1.0.0

### Major Changes

- 2a0349a: The first package major release. This time, it was fully reworked. All other @tma.js packages were moved to this package.

### Minor Changes

- ea7be2b: Implement WebApp.switchInlineQuery method

## 0.13.3

### Patch Changes

- Updated dependencies [a63953f]
- Updated dependencies [b8e9f9d]
- Updated dependencies [a861e65]
  - @tma.js/theme-params@1.0.0
  - @tma.js/parsing@1.0.1
  - @tma.js/bridge@1.4.1
  - @tma.js/launch-params@1.0.1
  - @tma.js/init-data@0.2.22

## 0.13.2

### Patch Changes

- Updated dependencies [302a294]
  - @tma.js/launch-params@1.0.0

## 0.13.1

### Patch Changes

- Updated dependencies [57f0b23]
  - @tma.js/bridge@1.4.0

## 0.13.0

### Minor Changes

- a4fd5b8: - Actualize theme parameters list
  - Simplify init process

### Patch Changes

- Updated dependencies [44ed697]
- Updated dependencies [6b97921]
- Updated dependencies [7a6549c]
- Updated dependencies [92848a6]
- Updated dependencies [7c1c7a2]
  - @tma.js/parsing@1.0.0
  - @tma.js/bridge@1.3.12
  - @tma.js/init-data@0.2.21
  - @tma.js/theme-params@0.1.0
  - @tma.js/launch-params@0.0.7

## 0.12.9

### Patch Changes

- 9d3956a: Fix the type of InitData.chatInstance property

## 0.12.8

### Patch Changes

- 6469933: Actualize links and comments
- Updated dependencies [6469933]
  - @tma.js/launch-params@0.0.6
  - @tma.js/init-data@0.2.20
  - @tma.js/parsing@0.1.3
  - @tma.js/bridge@1.3.11
  - @tma.js/utils@0.5.6
  - @tma.js/theme-params@0.0.6

## 0.12.7

### Patch Changes

- c69b4c6: `BackButton.on` and `MainButton.on` now return function which removes event listener.
- Updated dependencies [8e5c7d4]
  - @tma.js/event-emitter@0.1.0
  - @tma.js/bridge@1.3.10

## 0.12.6

### Patch Changes

- Updated dependencies [f39bb65]
  - @tma.js/launch-params@0.0.5
  - @tma.js/theme-params@0.0.5
  - @tma.js/init-data@0.2.19

## 0.12.5

### Patch Changes

- Updated dependencies [631a430]
  - @tma.js/bridge@1.3.9

## 0.12.4

### Patch Changes

- 3171451: Build packages in IIFE format
- Updated dependencies [3171451]
  - @tma.js/event-emitter@0.0.5
  - @tma.js/launch-params@0.0.4
  - @tma.js/theme-params@0.0.4
  - @tma.js/init-data@0.2.18
  - @tma.js/parsing@0.1.2
  - @tma.js/bridge@1.3.8
  - @tma.js/colors@0.0.5
  - @tma.js/utils@0.5.5

## 0.12.3

### Patch Changes

- c890f2d: Add missing chatType and chatInstance properties

## 0.12.2

### Patch Changes

- 3eafb45: Update package.json and fix entries for different modules.
- Updated dependencies [3eafb45]
  - @tma.js/event-emitter@0.0.4
  - @tma.js/launch-params@0.0.3
  - @tma.js/theme-params@0.0.3
  - @tma.js/init-data@0.2.17
  - @tma.js/parsing@0.1.1
  - @tma.js/bridge@1.3.7
  - @tma.js/colors@0.0.4
  - @tma.js/utils@0.5.4
  - @tma.js/util-types@0.0.3

## 0.12.1

### Patch Changes

- Updated dependencies [8ef4f81]
- Updated dependencies [bfbde56]
  - @tma.js/init-data@0.2.16
  - @tma.js/parsing@0.1.0
  - @tma.js/launch-params@0.0.2
  - @tma.js/bridge@1.3.6
  - @tma.js/theme-params@0.0.2

## 0.12.0

### Minor Changes

- e7add9d: Restore components state only in case, current page was reloaded.

### Patch Changes

- Updated dependencies [4df61ce]
  - @tma.js/launch-params@0.0.1
  - @tma.js/theme-params@0.0.1

## 0.11.6

### Patch Changes

- Updated dependencies [d4153de]
  - @tma.js/bridge@1.3.5

## 0.11.5

### Patch Changes

- 3c6ed39: - Start using Vite instead of pure Rollup
  - Update all package.json files in all packages
  - Implement `build-utils` package to share build utilities across all packages
  - Refactor tsconfig.json files
  - Complicate examples for React and SDK
- Updated dependencies [3c6ed39]
  - @tma.js/event-emitter@0.0.3
  - @tma.js/util-types@0.0.3
  - @tma.js/init-data@0.2.15
  - @tma.js/parsing@0.0.3
  - @tma.js/bridge@1.3.4
  - @tma.js/colors@0.0.3
  - @tma.js/utils@0.5.3

## 0.11.4

### Patch Changes

- Updated dependencies [654891f]
  - @tma.js/bridge@1.3.3

## 0.11.3

### Patch Changes

- 21c4632: Update docs URLs. Rename packages to @tma.js. Update deps
- Updated dependencies [21c4632]
  - @tma.js/event-emitter@0.0.2
  - @tma.js/util-types@0.0.2
  - @tma.js/init-data@0.2.14
  - @tma.js/parsing@0.0.2
  - @tma.js/bridge@1.3.2
  - @tma.js/colors@0.0.2
  - @tma.js/utils@0.5.2

## 0.11.2

### Patch Changes

- f1675d2: Fix viewport request in init function for Web K version.

## 0.11.1

### Patch Changes

- e947423: Update readme
- Updated dependencies [e947423]
  - @twa.js/bridge@1.3.1
  - @twa.js/init-data@0.2.13

## 0.11.0

### Minor Changes

- faaa346: Implement new CloudStorage component. Implement 6.9 methods. Make components restore from the session storage.

### Patch Changes

- Updated dependencies [5e23721]
- Updated dependencies [53d1717]
- Updated dependencies [251c527]
- Updated dependencies [665dcf4]
  - @twa.js/bridge@1.3.0
  - @twa.js/utils@0.5.1
  - @twa.js/event-emitter@0.0.1
  - @twa.js/util-types@0.0.1
  - @twa.js/parsing@0.0.1
  - @twa.js/colors@0.0.1
  - @twa.js/init-data@0.2.12

## 0.10.0

### Minor Changes

- 562e0c1: Improve cssVars option

## 0.9.1

### Patch Changes

- Updated dependencies [6ac7862]
  - @twa.js/bridge@1.2.0

## 0.9.0

### Minor Changes

- 87d0a68: Add isTWA function which checks if current environment is Telegram Web Apps. Export more utilities and types

## 0.8.0

### Minor Changes

- 2ba1d95: Refactor imports in @twa.js/bridge. Add withTimeout function to @twa.js/utils. Use timeouts during initialization process

### Patch Changes

- Updated dependencies [2ba1d95]
  - @twa.js/utils@0.5.0
  - @twa.js/bridge@1.1.3
  - @twa.js/init-data@0.2.11

## 0.7.3

### Patch Changes

- 5339167: Export misc types related to the platform

## 0.7.2

### Patch Changes

- 3c6bc51: Improve class names utilities. Re-export them in Solid SDK
- Updated dependencies [3c6bc51]
  - @twa.js/utils@0.4.0
  - @twa.js/bridge@1.1.2
  - @twa.js/init-data@0.2.10

## 0.7.1

### Patch Changes

- e71cea4: Add parseLaunchParams function to exports

## 0.7.0

### Minor Changes

- 8a0e39f: Allow passing custom launch parameters value into init function

## 0.6.0

### Minor Changes

- 04c2ce6: Add bug related to recursive calls of postEvent function. Allow usage of raw init data. Add an option to create global CSS variables.

## 0.5.3

### Patch Changes

- Updated dependencies [5868e9f]
  - @twa.js/utils@0.3.0
  - @twa.js/bridge@1.1.1
  - @twa.js/init-data@0.2.9

## 0.5.2

### Patch Changes

- 450e85e: Use methods instead of setters for header and background colors

## 0.5.1

### Patch Changes

- Updated dependencies [43fe082]
  - @twa.js/bridge@1.1.0

## 0.5.0

### Minor Changes

- 054d616: Fully rework bridge and release its first major update. Rename utilities in utils package. Make sdk components way better.

### Patch Changes

- Updated dependencies [054d616]
  - @twa.js/bridge@1.0.0
  - @twa.js/init-data@0.2.8
  - @twa.js/utils@0.2.12

## 0.4.6

### Patch Changes

- Updated dependencies [d0dd3ad]
  - @twa.js/bridge@0.3.9

## 0.4.5

### Patch Changes

- 684f0c0: Make init data optional launch parameter. This parameter could be missing in case, application was launched via inline keyboard button.

## 0.4.4

### Patch Changes

- 0f69488: Add exports property in package json.
- Updated dependencies [0f69488]
  - @twa.js/init-data@0.2.7
  - @twa.js/bridge@0.3.8
  - @twa.js/utils@0.2.11

## 0.4.3

### Patch Changes

- 5879578: Add src folder to package. Also, inline source typescript source code.
- Updated dependencies [5879578]
  - @twa.js/init-data@0.2.6
  - @twa.js/bridge@0.3.7

## 0.4.2

### Patch Changes

- Updated dependencies [aeed89d]
  - @twa.js/utils@0.2.10
  - @twa.js/bridge@0.3.6
  - @twa.js/init-data@0.2.5

## 0.4.1

### Patch Changes

- a103e42: Optimize imports, fix minor bugs.
- Updated dependencies [a103e42]
  - @twa.js/init-data@0.2.4
  - @twa.js/bridge@0.3.5
  - @twa.js/utils@0.2.9
