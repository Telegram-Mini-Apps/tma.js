import { createSignal } from '@/globals/signals-registry.js';

/**
 * True if the application is launched in inline mode.
 */
export const isInlineMode = createSignal(false);
