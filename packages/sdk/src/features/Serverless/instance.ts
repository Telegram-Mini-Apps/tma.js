import { retrieveRawInitDataFp } from '@tma.js/bridge';
import { function as fn } from 'fp-ts';

import { Serverless } from '@/features/Serverless/Serverless.js';
import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withVersion } from '@/fn-options/withVersion.js';

function instantiate() {
  return new Serverless({
    ...fn.pipe(sharedFeatureOptions(), withVersion),
    retrieveRawInitData: retrieveRawInitDataFp,
    fetch: (...args) => fetch(...args),
  });
}

export const serverless = /* @__PURE__*/ instantiate();
