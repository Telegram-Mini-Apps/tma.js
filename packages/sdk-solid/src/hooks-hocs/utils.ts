import { initUtils } from '@telegram-apps/sdk';

import { createHOC } from '../createHOC.js';
import { createHook } from '../createHook.js';

/**
 * Hook to receive the Utils component instance.
 */
export const useUtils = createHook(initUtils);

/**
 * HOC to pass the Utils component instance to the wrapped component.
 */
export const withUtils = createHOC(useUtils);
