import { initBiometryManager } from '@telegram-apps/sdk';

import { createHOCs } from '../createHOCs.js';
import { createHooks } from '../createHooks.js';

export const [useBiometryManagerRaw, useBiometryManager] = createHooks(initBiometryManager);

export const [withBiometryManagerRaw, withBiometryManager] = createHOCs(
  useBiometryManagerRaw,
  useBiometryManager,
);
