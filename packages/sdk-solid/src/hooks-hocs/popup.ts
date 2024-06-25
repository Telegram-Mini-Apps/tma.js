import { initPopup } from '@telegram-apps/sdk';

import { createHOC } from '../createHOC.js';
import { createHook } from '../createHook.js';

/**
 * Hook to receive the Popup component instance.
 */
export const usePopup = createHook(initPopup);

/**
 * HOC to pass the Popup component instance to the wrapped component.
 */
export const withPopup = createHOC(usePopup);
