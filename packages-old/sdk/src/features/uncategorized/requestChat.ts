import { RequestError } from '@tma.js/bridge';
import { taskEither as TE, function as fn } from 'fp-ts';

import { RequestChatError } from '@/errors.js';
import {
  sharedFeatureOptions,
  type SharedFeatureOptions,
} from '@/fn-options/sharedFeatureOptions.js';
import { withRequest, type WithRequest } from '@/fn-options/withRequest.js';
import { withVersion, type WithVersion } from '@/fn-options/withVersion.js';
import type { AsyncOptions } from '@/types.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import { withChecksFp } from '@/with-checks/withChecksFp.js';

export interface CreateRequestChatOptions extends SharedFeatureOptions, WithRequest, WithVersion {
}

export type RequestChatFnError = RequestError | RequestChatError;

export function createRequestChat({ request, ...rest }: CreateRequestChatOptions) {
  return withChecksFp((
    requestId: string,
    options?: AsyncOptions,
  ): TE.TaskEither<RequestChatFnError, void> => {
    return fn.pipe(
      request(
        'web_app_request_chat',
        ['requested_chat_failed', 'requested_chat_sent'],
        {
          ...options,
          params: { req_id: requestId },
        },
      ),
      TE.chain(response => (
        response.event === 'requested_chat_failed'
          ? TE.left(new RequestChatError(response.payload.error))
          : TE.right(undefined)
      )),
    );
  }, { ...rest, requires: 'web_app_request_chat', returns: 'task' });
}

// #__NO_SIDE_EFFECTS__
function instantiate() {
  return createRequestChat(fn.pipe(
    sharedFeatureOptions(),
    withRequest,
    withVersion,
  ));
}

/**
 * Prompts the user to choose a chat to share with the Mini App.
 * @param requestId - identifier of the prepared keyboard button, returned by the bot.
 * @since Mini Apps v9.6
 * @example
 * await requestChat('prepared-button-id');
 */
export const requestChatFp = instantiate();

/**
 * @see requestChatFp
 */
export const requestChat = throwifyWithChecksFp(requestChatFp);
