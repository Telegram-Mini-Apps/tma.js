import { initViewport } from '@telegram-apps/sdk';

import { createHOCs } from '../createHOCs.js';
import { createHooks } from '../createHooks.js';

export const [useViewportRaw, useViewport] = createHooks(initViewport);

export const [withViewportRaw, withViewport] = createHOCs(useViewportRaw, useViewport);
