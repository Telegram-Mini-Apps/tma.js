import { pipe } from 'fp-ts/function';

import { Popup } from '@/features/Popup/Popup.js';
import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withRequest } from '@/fn-options/withRequest.js';
import { withVersion } from '@/fn-options/withVersion.js';

function instantiate() {
  return new Popup(pipe(sharedFeatureOptions(), withRequest, withVersion));
}

export const popup = /* @__PURE__*/ instantiate();
