import { expect, it } from 'vitest';

import { hasWebviewProxy } from './hasWebviewProxy.js';

it('should return true if passed object contains path property "TelegramWebviewProxy.postEvent" and "postEvent" is a function property.', () => {
  expect(hasWebviewProxy({})).toBe(false);
  expect(hasWebviewProxy({ TelegramWebviewProxy: {} })).toBe(false);
  expect(hasWebviewProxy({ TelegramWebviewProxy: { postEvent: [] } })).toBe(false);
  expect(hasWebviewProxy({
    a: 'b',
    TelegramWebviewProxy: {
      postEvent: () => {
      },
    },
  })).toBe(true);
});
