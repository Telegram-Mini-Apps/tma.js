import { initSettingsButton } from '@telegram-apps/sdk';

import { createHOCs } from '../createHOCs.js';
import { createHooks } from '../createHooks.js';

export const [useSettingsButtonRaw, useSettingsButton] = createHooks(initSettingsButton);

export const [withSettingsButtonRaw, withSettingsButton] = createHOCs(
  useSettingsButtonRaw,
  useSettingsButton,
);
