import type { Request2FpFn } from '@tma.js/bridge';

import { createFnOption } from '@/fn-options/createFnOption.js';
import { request2Fp } from '@/globals/request.js';

export interface WithRequest {
  /**
   * A request function to use to call Mini Apps methods.
   */
  request: Request2FpFn;
}

export const withRequest = createFnOption<WithRequest>({ request: request2Fp });
