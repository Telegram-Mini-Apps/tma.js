---
"@tma.js/sdk": patch
---

Fix state mutation via `Stateful.getter` return values (fixes #870). Nested-object reads (e.g. `viewport.safeAreaInsets()`) now return a frozen shallow copy so consumer mutations cannot leak back into the internal state.
