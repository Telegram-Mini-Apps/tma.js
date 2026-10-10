import { MethodUnsupportedError } from '@tma.js/bridge';
import { describe, expect, it } from 'vitest';

import { createSwipeBehavior } from './swipeBehavior.js';
import { setup } from '../../../test/utils.js';

describe('swipeBehavior', () => {
  it('should toggle vertical swipes', () => {
    const calls = setup();
    const behavior = createSwipeBehavior();
    behavior.mount();
    expect(behavior.isVerticalEnabled()).toBe(true);
    behavior.disableVertical();
    expect(behavior.isVerticalEnabled()).toBe(false);
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_setup_swipe_behavior',
      params: { allow_vertical_swipe: false },
    });
  });

  it('should be supported since Mini Apps v7.7', () => {
    setup({ version: '7.6' });
    const behavior = createSwipeBehavior();
    expect(behavior.isSupported()).toBe(false);
    expect(() => behavior.mount()).toThrow(MethodUnsupportedError);
  });
});
