import { createFnOption } from '@/fn-options/createFnOption.js';
import { createRequestId } from '@/globals/createRequestId.js';

export interface WithCreateRequestId {
  /**
   * A function generating a request identifier.
   */
  createRequestId: () => string;
}

export const withCreateRequestId = createFnOption<WithCreateRequestId>({ createRequestId });
