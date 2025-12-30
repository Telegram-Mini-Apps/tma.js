import type { WriteAccessRequestedStatus, RequestError } from '@tma.js/bridge';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

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

export type RequestWriteAccessError = RequestError;

function create({ request, ...rest }: CreateOptions) {
  return withChecksFp((
    options?: AsyncOptions,
  ): TE.TaskEither<RequestWriteAccessError, WriteAccessRequestedStatus> => {
    return pipe(
      request('web_app_request_write_access', 'write_access_requested', options),
      TE.map(response => response.status),
    );
  }, { ...rest, requires: 'web_app_request_write_access', returns: 'task' });
}

// #__NO_SIDE_EFFECTS__
function instantiate() {
  return create(pipe(
    sharedFeatureOptions(),
    withVersion,
    withRequest,
  ));
}

/**
 * Requests write message access to the current user.
 * @param options - additional options.
 * @since Mini Apps v6.9
 */
export const requestWriteAccessFp = instantiate();

/**
 * @see requestWriteAccessFp
 */
export const requestWriteAccess = throwifyWithChecksFp(requestWriteAccessFp);
