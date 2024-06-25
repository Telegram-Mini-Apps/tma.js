import { initHapticFeedback } from '@telegram-apps/sdk';

import { createHOCs } from '../createHOCs.js';
import { createHooks } from '../createHooks.js';

export const [useHapticFeedbackRaw, useHapticFeedback] = createHooks(initHapticFeedback);

export const [withHapticFeedbackRaw, withHapticFeedback] = createHOCs(
  useHapticFeedbackRaw,
  useHapticFeedback,
);
