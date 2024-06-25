import { initHapticFeedback } from '@telegram-apps/sdk';

import { createHOC } from '../createHOC.js';
import { createHook } from '../createHook.js';

/**
 * Hook to receive the HapticFeedback component instance.
 */
export const useHapticFeedback = createHook(initHapticFeedback);

/**
 * HOC to pass the HapticFeedback component instance to the wrapped component.
 */
export const withHapticFeedback = createHOC(useHapticFeedback);
