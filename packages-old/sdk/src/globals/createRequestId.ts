import { createSignal } from '@/globals/signals-registry.js';

const lastRequestId = createSignal(0);

/**
 * @returns A new request identifier.
 */
export function createRequestId(): string {
  lastRequestId.set(lastRequestId() + 1);
  return lastRequestId().toString();
}
