import {
  requestFp as _requestFp,
  request2Fp as _request2Fp,
  type RequestFpFn,
  type RequestFn,
  type Request2FpFn,
  type Request2Fn,
} from '@tma.js/bridge';
import { throwifyFpFn } from '@tma.js/toolkit';

import { postEventFp } from '@/globals/postEvent.js';

/**
 * @deprecated To be removed in the next major update. Use `request2fp` instead, it provides
 * a proper way of handling multiple events.
 */
export const requestFp: RequestFpFn = (method: any, events: any, options: any) => {
  return _requestFp(method, events, {
    postEvent: postEventFp,
    ...options,
  });
};

export const request2Fp: Request2FpFn = (method: any, events: any, options: any) => {
  return _request2Fp(method, events, {
    postEvent: postEventFp,
    ...options,
  });
};

/**
 * @deprecated To be removed in the next major update. Use `request` instead, it provides
 * a proper way of handling multiple events.
 */
export const request = throwifyFpFn(requestFp) as RequestFn;

export const request2 = throwifyFpFn(request2Fp) as Request2Fn;
