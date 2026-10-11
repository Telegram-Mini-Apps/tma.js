import type { ThemeParams } from '@tma.js/types';

import { createSignal } from '@/globals/signals-registry.js';

/**
 * Mini application's theme parameters.
 */
export const themeParams = createSignal<ThemeParams>({});
