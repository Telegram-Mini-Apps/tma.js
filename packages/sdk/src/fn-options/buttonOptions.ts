import { on, off, type EventName } from '@tma.js/bridge';
import { pipe } from 'fp-ts/function';

import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withPostEvent } from '@/fn-options/withPostEvent.js';
import { withStateRestore } from '@/fn-options/withStateRestore.js';
import { withVersion } from '@/fn-options/withVersion.js';

// @__NO_SIDE_EFFECTS__
export function buttonOptions<S>(storageName: string, trackedClickEvent: EventName) {
  return {
    ...pipe(
      sharedFeatureOptions(),
      withPostEvent,
      withVersion,
      withStateRestore<S>(storageName),
    ),
    onClick(listener: VoidFunction, once?: boolean): VoidFunction {
      return on(trackedClickEvent, listener, once);
    },
    offClick(listener: VoidFunction, once?: boolean): void {
      off(trackedClickEvent, listener, once);
    },
  };
}
