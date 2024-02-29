import type { InitResult } from '@tma.js/sdk';
import { init } from '@tma.js/sdk';
import type { App } from 'vue';
import { readonly, ref } from 'vue';

import { SDKInjection } from './SDKInjection.js';
import type { SDKPluginOptions } from './types.js';

export function createSDK(props: SDKPluginOptions) {
  return {
    install(app: App) {
      const initResult = ref<InitResult>();
      const loading = ref(false);
      const error = ref();

      Promise
        .resolve(init(props.options ?? {}))
        .then((result) => {
          initResult.value = result;
        }).catch((err) => {
          error.value = err;
        }).finally(() => {
          loading.value = true;
        });

      app.provide(SDKInjection, {
        initResult: readonly(initResult),
        loading: readonly(loading),
        error: readonly(error),
      });
    },
  };
}
