import type { PostEventError } from '@tma.js/bridge';
import type * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

import {
  sharedFeatureOptions,
  type SharedFeatureOptions,
} from '@/fn-options/sharedFeatureOptions.js';
import { withPostEvent, type WithPostEvent } from '@/fn-options/withPostEvent.js';
import { withVersion, type WithVersion } from '@/fn-options/withVersion.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import { withChecksFp } from '@/with-checks/withChecksFp.js';

interface CreateOptions extends SharedFeatureOptions, WithPostEvent, WithVersion {
}

function create({ postEvent, ...rest }: CreateOptions) {
  return withChecksFp((): E.Either<PostEventError, void> => {
    return postEvent('web_app_add_to_home_screen');
  }, { ...rest, requires: 'web_app_add_to_home_screen', returns: 'either' });
}

// #__NO_SIDE_EFFECTS__
function instantiate() {
  return create(pipe(
    sharedFeatureOptions(),
    withVersion,
    withPostEvent,
  ));
}

/**
 * Prompts the user to add the Mini App to the home screen.
 * @since Mini Apps v8.0
 */
export const addToHomeScreenFp = instantiate();

/**
 * @see addToHomeScreenFp
 */
export const addToHomeScreen = throwifyWithChecksFp(addToHomeScreenFp);
