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

export interface ShareStoryOptions {
  /**
   * The caption to be added to the media.
   * 0-200 characters for regular users and 0-2048 characters for premium subscribers.
   * @see https://telegram.org/faq_premium#telegram-premium
   */
  text?: string;
  /**
   * An object that describes a widget link to be included in the story.
   * Note that only premium subscribers can post stories with links.
   * @see https://telegram.org/faq_premium#telegram-premium
   */
  widgetLink?: {
    /**
     * The URL to be included in the story.
     */
    url: string;
    /**
     * The name to be displayed for the widget link, 0-48 characters.
     */
    name?: string;
  };
}

export type ShareStoryError = PostEventError;

function create({ postEvent, ...rest }: CreateOptions) {
  return withChecksFp((
    mediaUrl: string,
    options: ShareStoryOptions = {},
  ): E.Either<ShareStoryError, void> => {
    return postEvent('web_app_share_to_story', {
      text: options.text,
      media_url: mediaUrl,
      widget_link: options.widgetLink,
    });
  }, { ...rest, requires: 'web_app_share_to_story', returns: 'either' });
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
 * Opens the native story editor.
 * @since Mini Apps v7.8
 * @example
 * pipe(
 *   shareStory('https://example.com/background.png', {
 *     text: 'Look at this cool group!',
 *     widgetLink: {
 *       url: 'https://t.me/heyqbnk',
 *       name: 'Vlad\'s community',
 *     },
 *   }),
 *   TE.match(error => {
 *     console.error('Something went wrong', error);
 *   }, () => {
 *     console.log('Call was successful');
 *   }),
 * );
 */
export const shareStoryFp = instantiate();

/**
 * @see shareStoryFp
 */
export const shareStory = throwifyWithChecksFp(shareStoryFp);
