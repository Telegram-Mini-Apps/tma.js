import { type PostEventFpFn } from '@tma.js/bridge';

import { createFnOption } from '@/fn-options/createFnOption.js';
import { postEventFp } from '@/globals/postEvent.js';

export interface WithPostEvent {
  /**
   * A postEvent function to use to call Mini Apps methods.
   */
  postEvent: PostEventFpFn;
}

export const withPostEvent = createFnOption<WithPostEvent>({
  postEvent: postEventFp,
});
