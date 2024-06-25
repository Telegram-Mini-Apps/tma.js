import { initMiniApp } from '@telegram-apps/sdk';

import { createHOC } from '../createHOC.js';
import { createHook } from '../createHook.js';

/**
 * Hook to receive the MiniApp component instance.
 */
export const useMiniApp = createHook(initMiniApp);

/**
 * HOC to pass the MiniApp component instance to the wrapped component.
 */
export const withMiniApp = createHOC(useMiniApp);
