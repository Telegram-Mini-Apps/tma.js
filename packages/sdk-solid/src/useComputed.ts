import type { Computed } from '@tma.js/sdk';
import { type Accessor, createSignal, getOwner, onCleanup } from 'solid-js';

/**
 * @returns Accessor to the value, updated whenever it changes. Inside a reactive owner, e.g.
 * a component, the subscription is removed when the owner is disposed.
 * @param computed - computed value, e.g. `backButton.isVisible` or `mainButton.state`.
 * @example
 * const isVisible = useComputed(backButton.isVisible);
 */
export function useComputed<T>(computed: Computed<T>): Accessor<T> {
  const [value, setValue] = createSignal(computed());
  // Passing a function, as the setter would call the value if it is a function itself.
  const unsubscribe = computed.subscribe(next => setValue(() => next));
  getOwner() && onCleanup(unsubscribe);
  return value;
}
