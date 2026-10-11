import { isTMAFp } from '@tma.js/bridge';
import { computed } from '@tma.js/signals';

import type { MaybeAccessor } from '@/types.js';

export interface SharedFeatureOptions {
  /**
   * True if the current environment is Telegram Mini Apps.
   */
  isTma: MaybeAccessor<boolean>;
}

export function sharedFeatureOptions(): SharedFeatureOptions {
  return { isTma: computed(() => isTMAFp()) };
}
