---
outline: [2, 3]
---

# @tma.js/sdk-vue

<p style="display: inline-flex; gap: 8px">
  <a href="https://npmjs.com/package/@tma.js/sdk-vue">
    <img src="https://img.shields.io/npm/v/@tma.js/sdk-vue?logo=npm"/>
  </a>
  <img src="https://img.shields.io/bundlephobia/minzip/@tma.js/sdk-vue"/>
  <a href="https://github.com/Telegram-Mini-Apps/tma.js/tree/master/packages/sdk-vue">
    <img src="https://img.shields.io/badge/source-black?logo=github"/>
  </a>
</p>

Vue bindings for [client SDK](tma-js-sdk/about.md). Includes composables, components and utilities
for comfortable usage of Vue on the Telegram Mini Apps platform.

## Installation

Before anything else, it is assumed that you have already installed the `vue` package, as it is
a peer dependency of this package.

::: code-group

```bash [pnpm]
pnpm i @tma.js/sdk-vue
```

```bash [npm]
npm i @tma.js/sdk-vue
```

```bash [yarn]
yarn add @tma.js/sdk-vue
```

:::

## Initialization

`SDKPlugin` is a vue plugin responsible for providing the SDK functionality. Internally, it
utilizes the `init` function from [@tma.js/sdk](tma-js-sdk/about.md). It accepts an optional list of
parameters through the [options](tma-js-sdk/init.md#options) argument.

```ts
import { createSDK, type InitOptions } from '@tma.js/sdk-vue';

const options: InitOptions = {
  acceptCustomStyles: true,
  cssVars: true,
};

const app = createApp(App)

app.use(createSDK(options))
app.mount('#app')
```

### Asynchronous

SDK initialization is considered asynchronous in case the `async` init option equals `true`.
This mode is useful in case the developer is using Server-Side Rendering or when the valid state of
all components is required.

Nevertheless, as long as this process is asynchronous, developers should be careful when calling
package-specific component composables, such as `useBackButton`, `useMainButton`, etc. When the SDK is not
yet initialized, these composables will throw an error as long as they will be unable to retrieve
the component from the SDK.

```vue
<script lang="ts" setup>
import { useMainButton } from '@tma.js/sdk-vue';

// We will get an error here as long as SDK is not yet initialized.
// The solution will be provided further.
const mainButton = useMainButton();
</script>
<template>
  <div>My application!</div>
</template>
```

Set `async` flag to `true` in the plugin initialization:
```ts
import { createSDK } from '@tma.js/sdk-vue';

const app = createApp(App)

app.use(createSDK({ async: true }))
app.mount('#app')
```

Root component for the whole project:
```vue
<script lang="ts" setup>
import { DisplayGate } from '@tma.js/sdk-vue';
import App from './App.vue';
</script>
<template>
  <DisplayGate>
    <App />
  </DisplayGate>
</template>
```

You might wonder why we need a component like `DisplayGate`. The reason is that the SDK
initialization process can be asynchronous. Some of its components need to send requests to the
Telegram application to fetch their current state. Due to this, we cannot determine the required
properties for these components until the initialization is completed.

As a result, all composables that return component instances will throw an error because they cannot
retrieve the necessary component from the SDK initialization result. Therefore, these composables should
not be called until the SDK is fully initialized.

`DisplayGate` is the built-in component which encapsulates logic related to application display.
It provides 3 optional slots, such as `initial`, `error` and `loading`.

Here is the complete example:

```vue
<script lang="ts" setup>
import { watchEffect } from 'vue';
import {
  useBackButton,
  useMiniApp,
} from '@tma.js/sdk-vue';

/**
 * Part of the application which doesn't know anything about SDK
 * initialization and which should be rendered only in case, SDK is already
 * initialized and could provide init result.
 */

const backButton = useBackButton();
const miniApp = useMiniApp();

// When App is attached to DOM, lets show back button and
// add "click" event handler, which should close current application.
// When component will unmount, listener will be removed.
watchEffect((onCleanup) => {
  backButton.value.show();
  
  onCleanup(
      backButton.value.on('click', () => miniApp.value.close())
  );
});
</script>
<template>
  <div>My application!</div>
</template>
```

```vue
<script>
const message = (error) => {
  return error instanceof Error
    ? error.message
    : JSON.stringify(error);
}
</script>
<template>
  <DisplayGate>
    <template #default>
      <App/>
    </template>
    
    <template #error="{ error }">
      <div>
        Oops. Something went wrong.
        <blockquote>
          <code> {{ message(error) }} </code>
        </blockquote>
      </div>
    </template>
    
    <template #loading>
      <div> SDK is loading. </div>
    </template>
    
    <template #initial>
      <div> Waiting for initialization to start. </div>
    </template>
  </DisplayGate>
</template>
```

### Synchronous

SDK initialization is considered synchronous in case the `async` init option is omitted or
equals `false`. In this case, `SDKProvider` will call the `init` function on the first render
(before the mount). This simplifies the application structure and allows avoiding the
definition of intermediate components.

```vue
<script lang="ts" setup>
import { useMainButton } from '@tma.js/sdk-vue';

// There will be no error here as long as initialization is synchronous
// and at this moment SDK is already initialized.
const mainButton = useMainButton();
</script>
<template>
  <div>My application!</div>
</template>
```

Don't set `async` flag to `true` in the plugin initialization:
```ts
import { createSDK } from '@tma.js/sdk-vue';

const app = createApp(App)

app.use(createSDK())
app.mount('#app')
```

::: info

The default initialization accepted by the package is synchronous.

:::

## Composables

### Launch Parameters

There may be cases where a developer needs to retrieve launch parameters without initializing the
entire SDK. For example, they might want to access current theme parameters stored
in `window.location`. In such cases, SDK initialization may not be necessary.

To retrieve Mini App launch parameters, the `useLaunchParams` composable can be used.

```vue
<script>
import { useLaunchParams } from '@tma.js/sdk-vue';

const launchParams = useLaunchParams();
</script>
<template>
  <pre>
    <code>
      {{ JSON.stringify(launchParams, null, ' ') }}
    </code>
  </pre>
</template>

```

### Init Result Related

The library provides a collection of simple composables for each init
result value. Here is the list of following composables and corresponding higher-order components:

- `useBackButton`. Returns the [BackButton](tma-js-sdk/components/back-button.md) component accessor
- `useClosingBehavior`. Returns the [ClosingBehavior](tma-js-sdk/components/closing-behavior.md)
  component accessor
- `useCloudStorage`. Returns the [CloudStorage](tma-js-sdk/components/cloud-storage.md) component
  accessor
- `useHapticFeedback`. Returns the [HapticFeedback](tma-js-sdk/components/haptic-feedback.md)
  component accessor
- `useInitData`. Returns the [InitData](tma-js-sdk/components/init-data.md) component accessor
- `useInitDataRaw`. Returns init data raw representation accessor
- `useInvoice`. Returns the [Invoice](tma-js-sdk/components/invoice.md) component accessor
- `useMainButton`. Returns the [MainButton](tma-js-sdk/components/main-button.md) component accessor
- `useMiniApp`. Returns the [MiniApp](tma-js-sdk/components/mini-app.md) component accessor
- `usePopup`. Returns the [Popup](tma-js-sdk/components/popup.md) component accessor
- `usePostEvent`. Returns the `postEvent` function accessor to call Telegram Mini Apps methods
- `useQRScanner`. Returns the [QRScanner](tma-js-sdk/components/qr-scanner.md) component accessor
- `useSettingsButton`. Returns the [SettingsButton](tma-js-sdk/components/settings-button.md)
  component accessor
- `useThemeParams`. Returns the [ThemeParams](tma-js-sdk/components/theme-params.md) component
  accessor
- `useUtils`. Returns the [Utils](tma-js-sdk/components/utils.md) component accessor
- `useViewport`. Returns the [Viewport](tma-js-sdk/components/viewport.md) component accessor

::: tip

Each of these composables returns SDK components signals which are automatically triggered if some of
their properties change.

:::

::: danger

Using these composables with an uninitialized SDK will result in throwing a corresponding error.

:::

## Template

::: info

WIP

:::