import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useSDK } from './useSDK.js';
import type { InitResultKey, InitResultValue } from '../types.js';

/**
 * Returns value by its field name from SDK init result.
 * @param key - init result key.
 * @throws {Error} SDK is not initialized.
 */
export function useInitResultValue<K extends InitResultKey>(
    key: K,
): ComputedRef<InitResultValue<K>> {
  const { initResult } = useSDK();

  return computed<InitResultValue<K>>(() => {
    if (!initResult.value) {
      throw new Error(`Unable to get init result key "${key}" as long as SDK is not initialized`);
    }

    return initResult.value[key];
  });
}
