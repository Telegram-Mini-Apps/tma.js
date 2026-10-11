import { function as fn } from 'fp-ts';

import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withCreateRequestId } from '@/fn-options/withCreateRequestId.js';
import { withRequest } from '@/fn-options/withRequest.js';
import { withVersion } from '@/fn-options/withVersion.js';

import { SecureStorage } from './SecureStorage.js';

function instantiate() {
  return new SecureStorage(fn.pipe(
    sharedFeatureOptions(),
    withVersion,
    withRequest,
    withCreateRequestId,
  ));
}

export const secureStorage = /* @__PURE__*/ instantiate();
