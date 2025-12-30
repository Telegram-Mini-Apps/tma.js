import { pipe } from 'fp-ts/function';

import { CloudStorage } from '@/features/CloudStorage/CloudStorage.js';
import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withInvokeCustomMethod } from '@/fn-options/withInvokeCustomMethod.js';
import { withVersion } from '@/fn-options/withVersion.js';

function instantiate() {
  return new CloudStorage(pipe(
    sharedFeatureOptions(),
    withVersion,
    withInvokeCustomMethod,
  ));
}

export const cloudStorage = /* @__PURE__*/ instantiate();
