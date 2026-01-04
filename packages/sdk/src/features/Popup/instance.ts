import { function as fn } from 'fp-ts';

import { Popup } from '@/features/Popup/Popup.js';
import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withRequest } from '@/fn-options/withRequest.js';
import { withVersion } from '@/fn-options/withVersion.js';

function instantiate() {
  return new Popup(fn.pipe(sharedFeatureOptions(), withRequest, withVersion));
}

export const popup = /* @__PURE__*/ instantiate();
