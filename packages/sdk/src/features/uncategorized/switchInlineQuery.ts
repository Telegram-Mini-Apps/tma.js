import type { PostEventError, SwitchInlineQueryChatType } from '@tma.js/bridge';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

import {
  sharedFeatureOptions,
  type SharedFeatureOptions,
} from '@/fn-options/sharedFeatureOptions.js';
import { withPostEvent, type WithPostEvent } from '@/fn-options/withPostEvent.js';
import { withVersion, type WithVersion } from '@/fn-options/withVersion.js';
import { isInlineMode } from '@/globals/isInlineMode.js';
import { access } from '@/helpers/access.js';
import type { MaybeAccessor } from '@/types.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import { withChecksFp } from '@/with-checks/withChecksFp.js';

interface CreateOptions extends SharedFeatureOptions, WithPostEvent, WithVersion {
  isInlineMode: MaybeAccessor<boolean>;
}

export type SwitchInlineQueryError = PostEventError;

function create({ isInlineMode, postEvent, ...rest }: CreateOptions) {
  return withChecksFp((
    query: string,
    chatTypes?: SwitchInlineQueryChatType[],
  ): E.Either<SwitchInlineQueryError, void> => {
    return postEvent('web_app_switch_inline_query', {
      query: query,
      chat_types: chatTypes || [],
    });
  }, {
    ...rest,
    requires: {
      every: ['web_app_switch_inline_query', () => {
        return access(isInlineMode)
          ? undefined
          : 'The application must be launched in the inline mode';
      }],
    },
    returns: 'either',
  });
}

// #__NO_SIDE_EFFECTS__
function instantiate() {
  return create({
    ...pipe(
      sharedFeatureOptions(),
      withPostEvent,
      withVersion,
    ),
    isInlineMode,
  });
}

/**
 * Inserts the bot's username and the specified inline query in the current chat's input field.
 * Query may be empty, in which case only the bot's username will be inserted. The client prompts
 * the user to choose a specific chat, then opens that chat and inserts the bot's username and
 * the specified inline query in the input field.
 * @param query - text which should be inserted in the input after the current bot name. Max
 * length is 256 symbols.
 * @param chatTypes - List of chat types which could be chosen to send the message. Could be an
 * empty list.
 * @since Mini Apps v6.7
 * @example
 * pipe(
 *   switchInlineQuery('my query goes here', ['users']),
 *   E.match(error => {
 *     console.error('Something went wrong', error);
 *   }, () => {
 *     console.log('Call was successful');
 *   }),
 * );
 */
export const switchInlineQueryFp = instantiate();

/**
 * @see switchInlineQueryFp
 */
export const switchInlineQuery = throwifyWithChecksFp(switchInlineQueryFp);
