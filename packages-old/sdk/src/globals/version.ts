import type { Version } from '@tma.js/types';

import { createSignal } from '@/globals/signals-registry.js';

/**
 * The current Mini Apps version.
 */
export const version = createSignal<Version>('0.0');
