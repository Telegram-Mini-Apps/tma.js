import type { Computed, DeepReadonly } from '@tma.js/sdk';
import { type Readable, readable } from 'svelte/store';

/**
 * @returns Store with the value. It is subscribed to the computed value only while it has
 * subscribers, so it can be created anywhere.
 * @param computed - computed value, e.g. `backButton.isVisible` or `mainButton.state`.
 * @example
 * const isVisible = useComputed(backButton.isVisible);
 * // In a component: {#if $isVisible}...{/if}
 */
export function useComputed<T>(computed: Computed<T>): Readable<DeepReadonly<T>> {
  return readable(computed(), set => {
    // The value could change while the store had no subscribers.
    set(computed());
    return computed.subscribe(next => set(next));
  });
}
