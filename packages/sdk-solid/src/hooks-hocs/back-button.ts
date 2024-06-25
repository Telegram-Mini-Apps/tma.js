import { initBackButton } from '@telegram-apps/sdk';

import { createHOC } from '../createHOC.js';
import { createHook } from '../createHook.js';

/**
 * Hook to receive the BackButton component instance.
 */
export const useBackButton = createHook(initBackButton);

/**
 * HOC to pass the BackButton component instance to the wrapped component.
 */
export const withBackButton = createHOC(useBackButton);
