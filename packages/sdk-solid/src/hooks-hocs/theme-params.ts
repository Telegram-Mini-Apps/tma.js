import { initThemeParams } from '@telegram-apps/sdk';

import { createHOC } from '../createHOC.js';
import { createHook } from '../createHook.js';

/**
 * Hook to receive the ThemeParams component instance.
 */
export const useThemeParams = createHook(initThemeParams);

/**
 * HOC to pass the ThemeParams component instance to the wrapped component.
 */
export const withThemeParams = createHOC(useThemeParams);
