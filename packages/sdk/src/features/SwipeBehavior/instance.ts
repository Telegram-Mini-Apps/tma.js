import { function as fn } from 'fp-ts';

import { SwipeBehavior, type SwipeBehaviorState } from '@/features/SwipeBehavior/SwipeBehavior.js';
import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withPostEvent } from '@/fn-options/withPostEvent.js';
import { withStateRestore } from '@/fn-options/withStateRestore.js';
import { withVersion } from '@/fn-options/withVersion.js';

function instantiate() {
  return new SwipeBehavior(fn.pipe(
    sharedFeatureOptions(),
    withPostEvent,
    withVersion,
    withStateRestore<SwipeBehaviorState>('swipeBehavior'),
  ));
}

export const swipeBehavior = /* @__PURE__*/ instantiate();
