import { type Ref, ref, shallowReadonly, onBeforeUnmount } from 'vue';

/**
 * Returns the underlying signal value updating it each time the signal value changes.
 * @param signal - a signal.
 */
export function useSignal<T>(signal: {
  (): T;
  sub(fn: (v: T) => void): VoidFunction;
}): Readonly<Ref<T>> {
  /**
   * We do type cast, otherwise inferred type is Ref<UnwrappedRef<T> | T>.
   * Another approach is to narrow down: <T extends (string | number | boolean | object | null)>
   * Like it's done in vueuse:
   * https://github.com/vueuse/vueuse/blob/main/packages/core/useStorage/index.ts#L135
   */
  const _value: Ref<T> = ref(signal()) as Ref<T>;
  const unsub = signal.sub(value => {
    _value.value = value;
  });
  onBeforeUnmount(unsub);

  return shallowReadonly(_value);
}
