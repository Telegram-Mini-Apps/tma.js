import { MethodUnsupportedError } from '@tma.js/bridge';
import { expect, it } from 'vitest';

import { hapticFeedback } from './hapticFeedback.js';
import { setup } from '../../../test/utils.js';

it('should trigger haptic feedback', () => {
  const calls = setup();
  hapticFeedback.impactOccurred('heavy');
  hapticFeedback.notificationOccurred('error');
  hapticFeedback.selectionChanged();
  expect(calls.mock.calls.map(([call]) => call.params)).toEqual([
    { type: 'impact', impact_style: 'heavy' },
    { type: 'notification', notification_type: 'error' },
    { type: 'selection_change' },
  ]);
});

it('should throw MethodUnsupportedError before v6.1', () => {
  setup({ version: '6.0' });
  expect(hapticFeedback.isSupported()).toBe(false);
  expect(() => hapticFeedback.selectionChanged()).toThrow(MethodUnsupportedError);
});
