import { pipe } from 'fp-ts/function';

import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withCreateRequestId } from '@/fn-options/withCreateRequestId.js';
import { withRequest } from '@/fn-options/withRequest.js';
import { withVersion } from '@/fn-options/withVersion.js';

import { SecureStorage } from './SecureStorage.js';

function instantiate() {
  return new SecureStorage(pipe(
    sharedFeatureOptions(),
    withVersion,
    withRequest,
    withCreateRequestId,
  ));
}

export const secureStorage = /* @__PURE__*/ instantiate();
