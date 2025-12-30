import { pipe } from 'fp-ts/function';

import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withCreateRequestId } from '@/fn-options/withCreateRequestId.js';
import { withRequest } from '@/fn-options/withRequest.js';
import { withVersion } from '@/fn-options/withVersion.js';

import { DeviceStorage } from './DeviceStorage.js';

function instantiate() {
  return new DeviceStorage(pipe(
    sharedFeatureOptions(),
    withVersion,
    withRequest,
    withCreateRequestId,
  ));
}

export const deviceStorage = /* @__PURE__*/ instantiate();
