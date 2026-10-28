---
"@tma.js/sdk": patch
"@tma.js/sdk-react": patch
"@tma.js/sdk-vue": patch
"@tma.js/sdk-solid": patch
"@tma.js/sdk-svelte": patch
---

Freeze objects and arrays returned by computed values, so mutating them no longer silently changes the component state. `Computed<T>` and `useComputed` return `DeepReadonly<T>`, which is exported from `@tma.js/sdk`.
