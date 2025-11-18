import { pipe } from 'fp-ts/function';

import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withCreateRequestId } from '@/fn-options/withCreateRequestId.js';
import { withRequest } from '@/fn-options/withRequest.js';
import { withVersion } from '@/fn-options/withVersion.js';

import { DeviceStorage } from './DeviceStorage.js';

export const deviceStorage = new DeviceStorage(pipe(
  sharedFeatureOptions(),
  withVersion,
  withRequest,
  withCreateRequestId,
));
