import { function as fn } from 'fp-ts';

import { Invoice } from '@/features/Invoice/Invoice.js';
import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withRequest } from '@/fn-options/withRequest.js';
import { withVersion } from '@/fn-options/withVersion.js';

function instantiate() {
  return new Invoice(fn.pipe(sharedFeatureOptions(), withRequest, withVersion));
}

export const invoice = /* @__PURE__*/ instantiate();
