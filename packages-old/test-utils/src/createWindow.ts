import { vi, type MockInstance } from 'vitest';

import { mockWindow, type Wnd } from './mockWindow';
import { createDomEmitter } from './createDomEmitter';

export type WindowSpy = MockInstance<() => Wnd>;

/**
 * Mocks window and returns created spy.
 * @param options - additional options.
 */
export function createWindow({ env, ...rest }: Partial<Wnd & { env: 'iframe' }> = {}): WindowSpy {
  return mockWindow({
    // We need this property to correctly re-emit received event from Telegram.
    parent: { postMessage: vi.fn() },
    ...createDomEmitter(),
    ...(env === 'iframe' ? { top: 1, self: 2 } : {}),
    ...rest,
  } as Wnd);
}
