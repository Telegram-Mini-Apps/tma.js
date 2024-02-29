import type { ComputedRef } from 'vue';

import { useInitResultValue } from './plugin/index.js';
import type {
  DynamicInitResultKey,
  InitResultKey,
  InitResultValue,
  StaticInitResultKey,
} from './types.js';

export type Composable<K extends InitResultKey> = () => ComputedRef<InitResultValue<K>>;

/**
 * Creates hook to retrieve static init result value.
 * @param initResultKey - init result key.
 */
export function createComposable<K extends StaticInitResultKey>(initResultKey: K): Composable<K>;

/**
 * Creates hook to retrieve dynamic init result value.
 * @param initResultKey - init result key.
 */
export function createComposable<K extends DynamicInitResultKey>(
  initResultKey: K,
): Composable<K>;

export function createComposable(initResultKey: InitResultKey): Composable<any> {
  return () => useInitResultValue(initResultKey);
}
