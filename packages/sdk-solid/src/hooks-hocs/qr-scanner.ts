import { initQRScanner } from '@telegram-apps/sdk';

import { createHOC } from '../createHOC.js';
import { createHook } from '../createHook.js';

/**
 * Hook to receive the QRScanner component instance.
 */
export const useQRScanner = createHook(initQRScanner);

/**
 * HOC to pass the QRScanner component instance to the wrapped component.
 */
export const withQRScanner = createHOC(useQRScanner);
