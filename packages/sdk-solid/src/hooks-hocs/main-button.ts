import { initMainButton } from '@telegram-apps/sdk';

import { createHOC } from '../createHOC.js';
import { createHook } from '../createHook.js';

/**
 * Hook to receive the MainButton component instance.
 */
export const useMainButton = createHook(initMainButton);

/**
 * HOC to pass the MainButton component instance to the wrapped component.
 */
export const withMainButton = createHOC(useMainButton);
