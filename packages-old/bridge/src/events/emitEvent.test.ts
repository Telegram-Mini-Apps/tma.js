import { mockWindow } from 'test-utils';
import { expect, it, vi } from 'vitest';

import { emitEvent } from './emitEvent.js';

it('should call window.dispatchEvent with the Message event containing properties "data" property equal to { eventType, eventData } stringified and "source" property equal to window.parent', () => {
  const dispatchEvent = vi.fn();
  mockWindow({
    dispatchEvent,
    parent: 'PARENT',
  } as any);
  emitEvent('test', 'some-data');
  expect(dispatchEvent).toHaveBeenCalledOnce();
  expect(dispatchEvent.mock.calls[0][0]).toBeInstanceOf(MessageEvent);
  expect(dispatchEvent.mock.calls[0][0]).toMatchObject({
    type: 'message',
    data: '{"eventType":"test","eventData":"some-data"}',
    source: 'PARENT' as any,
  });
});
