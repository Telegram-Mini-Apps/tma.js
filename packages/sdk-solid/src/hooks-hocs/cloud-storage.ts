import { initCloudStorage } from '@telegram-apps/sdk';

import { createHOC } from '../createHOC.js';
import { createHook } from '../createHook.js';

/**
 * Hook to receive the CloudStorage component instance.
 */
export const useCloudStorage = createHook(initCloudStorage);

/**
 * HOC to pass the CloudStorage component instance to the wrapped component.
 */
export const withCloudStorage = createHOC(useCloudStorage);
