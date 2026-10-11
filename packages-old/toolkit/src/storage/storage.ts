/**
 * Converts a passed storage key to the formatted state.
 * @param key - storage key.
 */
function formatKey(key: string): string {
  return `tapps/${key}`;
}

/**
 * Saves value in the storage.
 * @param key - storage key.
 * @param value - storage value.
 */
export function setStorageValue<T>(key: string, value: T): void {
  sessionStorage.setItem(formatKey(key), JSON.stringify(value));
}

/**
 * Extracts value from the storage.
 * @param key - storage key.
 */
export function getStorageValue<R>(key: string): R | undefined {
  const value = sessionStorage.getItem(formatKey(key));
  try {
    return value ? JSON.parse(value) as R : undefined;
  } catch {
  }
}
