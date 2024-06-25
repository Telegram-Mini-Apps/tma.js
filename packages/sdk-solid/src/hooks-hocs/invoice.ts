import { initInvoice } from '@telegram-apps/sdk';

import { createHOC } from '../createHOC.js';
import { createHook } from '../createHook.js';

/**
 * Hook to receive the Invoice component instance.
 */
export const useInvoice = createHook(initInvoice);

/**
 * HOC to pass the Invoice component instance to the wrapped component.
 */
export const withInvoice = createHOC(useInvoice);
