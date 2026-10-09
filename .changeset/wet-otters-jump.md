---
"@tma.js/sdk-solid": patch
---

Add support for solid-js v2 (peer dependency range widened to `^1.0.0 || ^2.0.0-rc.0`). `useSignal` now compiles cleanly against solid-js v2's stricter `createSignal` overloads by asserting the initial value excludes `Function`, matching the runtime behavior already present in v1.
