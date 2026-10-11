import type { PhoneRequestedStatus, RequestError } from '@tma.js/bridge';
import { taskEither as TE, function as fn } from 'fp-ts';

import {
  sharedFeatureOptions,
  type SharedFeatureOptions,
} from '@/fn-options/sharedFeatureOptions.js';
import { withRequest, type WithRequest } from '@/fn-options/withRequest.js';
import { withVersion, type WithVersion } from '@/fn-options/withVersion.js';
import type { AsyncOptions } from '@/types.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import { withChecksFp } from '@/with-checks/withChecksFp.js';

interface CreateOptions extends SharedFeatureOptions, WithRequest, WithVersion {
}

export type RequestPhoneAccessError = RequestError;

function create({ request, ...rest }: CreateOptions) {
  return withChecksFp((
    options?: AsyncOptions,
  ): TE.TaskEither<RequestPhoneAccessError, PhoneRequestedStatus> => {
    return fn.pipe(
      request('web_app_request_phone', 'phone_requested', options),
      TE.map(response => response.status),
    );
  }, { ...rest, requires: 'web_app_request_phone', returns: 'task' });
}

// #__NO_SIDE_EFFECTS__
function instantiate() {
  return create(fn.pipe(
    sharedFeatureOptions(),
    withVersion,
    withRequest,
  ));
}

/**
 * Requests current user phone access. Method returns promise, which resolves
 * status of the request. In case, user accepted the request, Mini App bot will receive
 * the according notification.
 *
 * To obtain the retrieved information instead, utilize the `requestContact` method.
 * @param options - additional options.
 * @since Mini Apps v6.9
 * @see requestContact
 */
export const requestPhoneAccessFp = instantiate();

/**
 * @see requestPhoneAccessFp
 */
export const requestPhoneAccess = throwifyWithChecksFp(requestPhoneAccessFp);
