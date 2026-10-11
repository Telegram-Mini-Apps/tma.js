import { access } from '@/helpers/access.js';
import type { MaybeAccessor } from '@/types.js';

export function createFnOption<T>(mix: MaybeAccessor<T>) {
  return <O extends object>(obj: O) => {
    return { ...obj, ...access(mix) };
  };
}
