import type { PostEventError } from '@tma.js/bridge';
import * as E from 'fp-ts/Either';
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

export type HideKeyboardError = PostEventError;

function create({ postEvent, ...rest }: CreateOptions) {
  return withChecksFp((): E.Either<HideKeyboardError, void> => {
    return postEvent('web_app_hide_keyboard');
  }, { ...rest, returns: 'either', requires: 'web_app_hide_keyboard' });
}

// #__NO_SIDE_EFFECTS__
function instantiate() {
  return create(pipe(
    sharedFeatureOptions(),
    withPostEvent,
    withVersion,
  ));
}

/**
 * Hides the on-screen keyboard, if it is currently visible. Does nothing if the keyboard is
 * not active.
 * @since Mini Apps v9.1
 */
export const hideKeyboardFp = instantiate();

/**
 * @see hideKeyboardFp
 */
export const hideKeyboard = throwifyWithChecksFp(hideKeyboardFp);
