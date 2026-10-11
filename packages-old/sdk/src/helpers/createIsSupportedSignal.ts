import { type MethodName, supports } from '@tma.js/bridge';
import { type Computed, computed } from '@tma.js/signals';
import type { Version } from '@tma.js/types';

import { access } from '@/helpers/access.js';
import type { MaybeAccessor } from '@/types.js';

export function createIsSupportedSignal(
  method: MethodName,
  version: MaybeAccessor<Version>,
): Computed<boolean> {
  return computed(() => supports(method, access(version)));
}
