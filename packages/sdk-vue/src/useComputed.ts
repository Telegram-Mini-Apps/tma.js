import type { Computed, DeepReadonly } from '@tma.js/sdk';
import { getCurrentScope, onScopeDispose, type Ref, shallowReadonly, shallowRef } from 'vue';

/**
 * @returns Readonly ref to the value, updated whenever it changes. Inside an effect scope, e.g.
 * a component setup, the subscription is removed when the scope is disposed.
 * @param computed - computed value, e.g. `backButton.isVisible` or `mainButton.state`.
 * @example
 * const isVisible = useComputed(backButton.isVisible);
 */
export function useComputed<T>(computed: Computed<T>): Readonly<Ref<DeepReadonly<T>>> {
  // Shallow, so the SDK objects are not wrapped into proxies and keep their identity.
  const value = shallowRef(computed());
  const unsubscribe = computed.subscribe(next => {
    value.value = next;
  });
  getCurrentScope() && onScopeDispose(unsubscribe);
  return shallowReadonly(value);
}
