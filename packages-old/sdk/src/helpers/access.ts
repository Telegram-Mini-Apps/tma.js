import type { MaybeAccessor } from '@/types.js';

export function access<T>(value: MaybeAccessor<T>): T {
  return typeof value === 'function' ? (value as any)() as T : value;
}
