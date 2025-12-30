import { pipe } from 'fp-ts/function';

import { HapticFeedback } from '@/features/HapticFeedback/HapticFeedback.js';
import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withPostEvent } from '@/fn-options/withPostEvent.js';
import { withVersion } from '@/fn-options/withVersion.js';

function instantiate() {
  return new HapticFeedback(pipe(
    sharedFeatureOptions(),
    withPostEvent,
    withVersion,
  ));
}

export const hapticFeedback = /* @__PURE__*/ instantiate();
