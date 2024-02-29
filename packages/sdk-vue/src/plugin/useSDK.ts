import { inject } from 'vue';

import { SDKInjection } from './SDKInjection.js';
import type { SDKInjectionType } from './types.js';

/**
 * Returns current SDK information.
 */
export function useSDK(): SDKInjectionType {
  const context = inject(SDKInjection);

  if (!context) {
    throw new Error('Unable to get sdk as long as SDK is not provided');
  }

  return context;
}
