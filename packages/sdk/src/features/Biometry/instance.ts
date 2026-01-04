import { on, off } from '@tma.js/bridge';
import { function as fn } from 'fp-ts';

import { Biometry } from '@/features/Biometry/Biometry.js';
import type { BiometryState } from '@/features/Biometry/types.js';
import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withPostEvent } from '@/fn-options/withPostEvent.js';
import { withRequest } from '@/fn-options/withRequest.js';
import { withStateRestore } from '@/fn-options/withStateRestore.js';
import { withVersion } from '@/fn-options/withVersion.js';

function instantiate() {
  return new Biometry({
    ...fn.pipe(
      sharedFeatureOptions(),
      withPostEvent,
      withVersion,
      withRequest,
      withStateRestore<BiometryState>('biometry'),
    ),
    offInfoReceived(listener) {
      off('biometry_info_received', listener);
    },
    onInfoReceived(listener) {
      return on('biometry_info_received', listener);
    },
  });
}

export const biometry = /* @__PURE__*/ instantiate();
