import { RequestError } from '@tma.js/bridge';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import { ShareMessageError } from '@/errors.js';
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

export type ShareMessageFnError = RequestError | ShareMessageError;

function create({ request, ...rest }: CreateOptions) {
  return withChecksFp((
    messageId: string,
    options?: AsyncOptions,
  ): TE.TaskEither<ShareMessageFnError, void> => {
    return pipe(
      request(
        'web_app_send_prepared_message',
        ['prepared_message_failed', 'prepared_message_sent'],
        {
          ...options,
          params: { id: messageId },
        },
      ),
      TE.chain(response => (
        response.event === 'prepared_message_failed'
          ? TE.left(new ShareMessageError(response.payload.error))
          : TE.right(undefined)
      )),
    );
  }, { ...rest, requires: 'web_app_send_prepared_message', returns: 'task' });
}

// #__NO_SIDE_EFFECTS__
function instantiate() {
  return create(pipe(
    sharedFeatureOptions(),
    withRequest,
    withVersion,
  ));
}

/**
 * Opens a dialog allowing the user to share a message provided by the bot.
 * @since Mini Apps v8.0
 */
export const shareMessageFp = instantiate();

/**
 * @see shareMessageFp
 */
export const shareMessage = throwifyWithChecksFp(shareMessageFp);
