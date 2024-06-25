import { initUtils } from '@telegram-apps/sdk';

import { createHOCs } from '../createHOCs.js';
import { createHooks } from '../createHooks.js';

export const [useUtilsRaw, useUtils] = createHooks(initUtils);

export const [withUtilsRaw, withUtils] = createHOCs(useUtilsRaw, useUtils);
