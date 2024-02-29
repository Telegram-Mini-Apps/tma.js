import type { InitOptions, InitResult } from '@tma.js/sdk';
import type { Ref } from 'vue';

export type SDKPluginOptions = {
  /**
   * Init function options.
   */
  options?: InitOptions;
};

export interface SDKInjectionType {
  /**
   * Error occurred during initialization.
   */
  error: Readonly<Ref<unknown | undefined>>;

  /**
   * Initialization result.
   */
  initResult: Readonly<Ref<InitResult | undefined>>;

  /**
   * True if SDK is loading.
   */
  loading: Readonly<Ref<boolean>>;
}
