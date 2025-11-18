import { type PostEventFpFn } from '@tma.js/bridge';
import * as E from 'fp-ts/Either';
import { describe, expect, it, vi } from 'vitest';

import { testIsSupportedPure } from '~/test-utils/predefined/testIsSupportedPure.js';
import { testSafetyPure } from '~/test-utils/predefined/testSafetyPure.js';

import { HapticFeedback } from '@/features/HapticFeedback/HapticFeedback.js';

const MIN_VERSION = '6.1';

function instantiate({
  version = MIN_VERSION,
  postEvent = () => E.right(undefined),
  isTma = true,
}: {
  version?: string;
  postEvent?: PostEventFpFn;
  isTma?: boolean;
} = {}) {
  return new HapticFeedback({ version, postEvent, isTma });
}

describe.each([
  ['impactOccurred', (component: HapticFeedback) => component.impactOccurred('heavy')],
  ['notificationOccurred', (component: HapticFeedback) => component.notificationOccurred('error')],
  ['selectionChanged', (component: HapticFeedback) => component.selectionChanged()],
] as const)('%s', (method, tryCall) => {
  describe('safety', () => {
    testSafetyPure({
      instantiate,
      get: instance => instance[method],
      try: tryCall,
      minVersion: MIN_VERSION,
    });
  });
});

describe('impactOccurred', () => {
  it(
    'should call "web_app_trigger_haptic_feedback" with { type: "impact", impact_style: {{arg}} }',
    () => {
      const postEvent = vi.fn(() => E.right(undefined));
      instantiate({ postEvent }).impactOccurred('heavy');
      expect(postEvent).toHaveBeenCalledOnce();
      expect(postEvent).toHaveBeenCalledWith(
        'web_app_trigger_haptic_feedback',
        { type: 'impact', impact_style: 'heavy' },
      );
    },
  );
});

describe('notificationOccurred', () => {
  it(
    'should call "web_app_trigger_haptic_feedback" with { type: "notification", notification_type: {{arg}} }',
    () => {
      const postEvent = vi.fn(() => E.right(undefined));
      instantiate({ postEvent }).notificationOccurred('success');
      expect(postEvent).toHaveBeenCalledOnce();
      expect(postEvent).toHaveBeenCalledWith(
        'web_app_trigger_haptic_feedback',
        { type: 'notification', notification_type: 'success' },
      );
    },
  );
});

describe('selectionChanged', () => {
  it(
    'should call "web_app_trigger_haptic_feedback" with { type: "selection_change" }',
    () => {
      const postEvent = vi.fn(() => E.right(undefined));
      instantiate({ postEvent }).selectionChanged();
      expect(postEvent).toHaveBeenCalledOnce();
      expect(postEvent).toHaveBeenCalledWith(
        'web_app_trigger_haptic_feedback',
        { type: 'selection_change' },
      );
    },
  );
});

describe('isSupported', () => {
  testIsSupportedPure(version => instantiate({ isTma: true, version }), MIN_VERSION);
});
