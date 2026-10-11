import { vi } from 'vitest';

import { formatImplementation, type MockImplementation } from './formatImplementation';

export type Wnd = Window & typeof globalThis;

/**
 * Mocks window getter.
 * @param impl - window getter implementation.
 */
export function mockWindow(impl: MockImplementation<Wnd>) {
  return vi
    .spyOn(global, 'window', 'get')
    .mockImplementation(formatImplementation(impl));
}
