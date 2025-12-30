import { pipe } from 'fp-ts/function';

import {
  ClosingBehavior,
  type ClosingBehaviorState,
} from '@/features/ClosingBehavior/ClosingBehavior.js';
import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withPostEvent } from '@/fn-options/withPostEvent.js';
import { withStateRestore } from '@/fn-options/withStateRestore.js';

function instantiate() {
  return new ClosingBehavior(pipe(
    sharedFeatureOptions(),
    withStateRestore<ClosingBehaviorState>('closingBehavior'),
    withPostEvent,
  ));
}

export const closingBehavior = /* @__PURE__*/ instantiate();
