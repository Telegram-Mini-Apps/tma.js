import type { Computed, DeepReadonly } from '@tma.js/sdk';
import { useSyncExternalStore } from 'react';

/**
 * @returns The current value, re-rendering the React component whenever it changes.
 * @param computed - computed value, e.g. `backButton.isVisible` or `mainButton.state`.
 * @param getServerSnapshot - function returning the value used during server rendering and
 * hydration. Defaults to `computed`.
 * @example
 * const isVisible = useComputed(backButton.isVisible);
 * const { text } = useComputed(mainButton.state);
 */
export function useComputed<T>(
  computed: Computed<T>,
  getServerSnapshot: () => DeepReadonly<T> = computed,
): DeepReadonly<T> {
  return useSyncExternalStore(computed.subscribe, computed, getServerSnapshot);
}
