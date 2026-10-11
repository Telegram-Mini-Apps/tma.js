import type { Version } from '@tma.js/types';

import { createFnOption } from '@/fn-options/createFnOption.js';
import { version } from '@/globals/version.js';
import type { MaybeAccessor } from '@/types.js';

export interface WithVersion {
  /**
   * The currently supported Telegram Mini Apps version by the Telegram client.
   */
  version: MaybeAccessor<Version>;
}

export const withVersion = createFnOption<WithVersion>({ version });
