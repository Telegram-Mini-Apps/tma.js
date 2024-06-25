import { initClosingBehavior } from '@telegram-apps/sdk';

import { createHOC } from '../createHOC.js';
import { createHook } from '../createHook.js';

/**
 * Hook to receive the ClosingBehavior component instance.
 */
export const useClosingBehavior = createHook(initClosingBehavior);

/**
 * HOC to pass the ClosingBehavior component instance to the wrapped component.
 */
export const withClosingBehavior = createHOC(useClosingBehavior);
