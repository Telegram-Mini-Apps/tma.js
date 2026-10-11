import { getStorageValue, setStorageValue } from '@tma.js/toolkit';

export interface ComponentStorage<T> {
  get: () => T | undefined;
  set: (value: T) => void;
}

/**
 * Creates a new sessionStorage-based component storage.
 * @param key - session storage key to use.
 */
export function createComponentSessionStorage<T>(key: string): ComponentStorage<T> {
  return {
    get: () => getStorageValue<T>(key),
    set(value) {
      setStorageValue<T>(key, value);
    },
  };
}
