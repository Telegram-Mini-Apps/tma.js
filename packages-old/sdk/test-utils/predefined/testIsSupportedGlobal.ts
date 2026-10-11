import { beforeEach } from 'vitest';
import { testIsSupportedPure } from '~/test-utils/predefined/testIsSupportedPure.js';
import { setVersion } from '~/test-utils/utils.js';

import { resetGlobals } from '@/globals/resetGlobals.js';

/**
 * Tests if the isSupported property works correctly.
 */
export function testIsSupportedGlobal(
  obj: { isSupported(): boolean },
  minVersion: string,
) {
  beforeEach(resetGlobals);

  testIsSupportedPure(
    version => {
      setVersion(version);
      return obj;
    },
    minVersion,
  );
}
