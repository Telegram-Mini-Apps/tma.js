import { vi } from 'vitest';

import { formatImplementation, type MockImplementation } from './formatImplementation';

/**
 * Mocks performance.getEntriesByType.
 * @param impl - method implementation.
 */
export function mockPerformanceGetEntriesByType(
  impl: MockImplementation<PerformanceEntry[]> = [],
) {
  return vi
    .spyOn(performance, 'getEntriesByType')
    .mockImplementation(formatImplementation(impl));
}
