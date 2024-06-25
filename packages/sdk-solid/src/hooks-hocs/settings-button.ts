import { initSettingsButton } from '@telegram-apps/sdk';

import { createHOC } from '../createHOC.js';
import { createHook } from '../createHook.js';

/**
 * Hook to receive the SettingsButton component instance.
 */
export const useSettingsButton = createHook(initSettingsButton);

/**
 * HOC to pass the SettingsButton component instance to the wrapped component.
 */
export const withSettingsButton = createHOC(useSettingsButton);
