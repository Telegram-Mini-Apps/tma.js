import { postEventFp as _postEventFp, type PostEventFpFn, type PostEventFn } from '@tma.js/bridge';
import { throwifyAnyEither } from '@tma.js/toolkit';

import { createSignal } from '@/globals/signals-registry.js';

export const postEventFpSignal = createSignal(_postEventFp);

export const postEventFp: PostEventFpFn = (...args: any[]) => {
  return (postEventFpSignal as any)()(...args);
};

export const postEvent: PostEventFn = (...args: any[]) => {
  return throwifyAnyEither((postEventFp as any)(...args));
};
