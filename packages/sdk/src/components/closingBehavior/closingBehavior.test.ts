import { describe, expect, it } from 'vitest';

import { createClosingBehavior } from './closingBehavior.js';
import { setup } from '../../../test/utils.js';
import { NotMountedError } from '../../errors.js';

describe('closingBehavior', () => {
  it('should toggle the confirmation', () => {
    const calls = setup();
    const behavior = createClosingBehavior();
    expect(() => behavior.enableConfirmation()).toThrow(NotMountedError);
    behavior.mount();
    behavior.enableConfirmation();
    behavior.enableConfirmation();
    expect(behavior.isConfirmationEnabled()).toBe(true);
    behavior.disableConfirmation();
    expect(behavior.isConfirmationEnabled()).toBe(false);
    expect(calls.mock.calls).toEqual([
      [{ name: 'web_app_setup_closing_behavior', params: { need_confirmation: true } }],
      [{ name: 'web_app_setup_closing_behavior', params: { need_confirmation: false } }],
    ]);
  });
});
