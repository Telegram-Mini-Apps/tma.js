import { initBiometryManager } from '@telegram-apps/sdk';

import { createHOC } from '../createHOC.js';
import { createHook } from '../createHook.js';

/**
 * Hook to receive the BiometryManager component instance.
 */
export const useBiometryManager = createHook(initBiometryManager);

/**
 * HOC to pass the BiometryManager component instance to the wrapped component.
 */
export const withBiometryManager = createHOC(useBiometryManager);
