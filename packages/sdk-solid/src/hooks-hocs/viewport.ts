import { initViewport } from '@telegram-apps/sdk';

import { createHOC } from '../createHOC.js';
import { createHook } from '../createHook.js';

/**
 * Hook to receive the Viewport component instance.
 */
export const useViewport = createHook(initViewport);

/**
 * HOC to pass the Viewport component instance to the wrapped component.
 */
export const withViewport = createHOC(useViewport);
