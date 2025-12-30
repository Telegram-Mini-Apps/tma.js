import type { HomeScreenStatus, RequestError } from '@tma.js/bridge';
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

function create({ request, ...rest }: CreateOptions) {
  return withChecksFp((options?: AsyncOptions): TE.TaskEither<RequestError, HomeScreenStatus> => {
    return pipe(
      request('web_app_check_home_screen', 'home_screen_checked', options),
      TE.map(response => response.status || 'unknown'),
    );
  }, { ...rest, requires: 'web_app_check_home_screen', returns: 'task' });
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
 * Sends a request to the native Telegram application to check if the current mini
 * application is added to the device's home screen.
 * @param options - additional options.
 * @since Mini Apps v8.0
 */
export const checkHomeScreenStatusFp = instantiate();

/**
 * @see checkHomeScreenStatusFp
 */
export const checkHomeScreenStatus = throwifyWithChecksFp(checkHomeScreenStatusFp);
