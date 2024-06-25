import { initInitData } from '@telegram-apps/sdk';

import { createHOC } from '../createHOC.js';
import { createHook } from '../createHook.js';

/**
 * Hook to receive the InitData component instance.
 */
export const useInitData = createHook(initInitData);

/**
 * HOC to pass the InitData component instance to the wrapped component.
 */
export const withInitData = createHOC(useInitData);
