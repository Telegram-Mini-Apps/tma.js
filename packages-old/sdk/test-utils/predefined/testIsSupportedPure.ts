import { it, expect } from 'vitest';
import { getPrevVersion } from '~/test-utils/utils.js';

/**
 * Tests if the isSupported property works correctly.
 */
export function testIsSupportedPure(
  instantiate: (version: string) => {
    isSupported: () => boolean;
  },
  minVersion: string,
) {
  it(`should return false if version is < ${minVersion}`, () => {
    expect(instantiate(getPrevVersion(minVersion)).isSupported()).toBe(false);
  });

  it(`should return true if version is >= ${minVersion}`, () => {
    expect(instantiate(minVersion).isSupported()).toBe(true);
  });
}
