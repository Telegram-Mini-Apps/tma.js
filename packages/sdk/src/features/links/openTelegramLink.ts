import { supports, type PostEventError } from '@tma.js/bridge';
import * as fp from 'fp-ts';

import { InvalidArgumentsError } from '@/errors.js';
import {
  type SharedFeatureOptions,
  sharedFeatureOptions,
} from '@/fn-options/sharedFeatureOptions.js';
import { withPostEvent, type WithPostEvent } from '@/fn-options/withPostEvent.js';
import { withVersion, type WithVersion } from '@/fn-options/withVersion.js';
import { access } from '@/helpers/access.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import { withChecksFp } from '@/with-checks/withChecksFp.js';

export interface CreateOpenTelegramLinkOptions extends SharedFeatureOptions,
  WithPostEvent,
  WithVersion {
}

export type OpenTelegramLinkError = PostEventError | InvalidArgumentsError;

export function createOpenTelegramLink({
  postEvent,
  version,
  ...rest
}: CreateOpenTelegramLinkOptions) {
  return withChecksFp((
    url: string | URL,
  ): fp.either.Either<OpenTelegramLinkError, void> => {
    try {
      url = new URL(url);
    } catch {
      return fp.either.left(new InvalidArgumentsError(`"${url.toString()}" is invalid URL`));
    }
    const allowedHostnames = ['t.me', 'telegram.dog', 'telegram.me'];
    if (!allowedHostnames.includes(url.hostname)) {
      return fp.either.left(new InvalidArgumentsError(`"${url.toString()}" is invalid URL`));
    }
    const path = url.pathname + url.search;
    if (supports('web_app_open_tg_link', access(version))) {
      return postEvent('web_app_open_tg_link', { path_full: path });
    }
    window.location.href = 'https://telegram.me' + path;
    return fp.either.right(undefined);
  }, { ...rest, returns: 'either' });
}

// #__NO_SIDE_EFFECTS__
function instantiate() {
  return createOpenTelegramLink(fp.function.pipe(
    sharedFeatureOptions(),
    withPostEvent,
    withVersion,
  ));
}

/**
 * Opens a Telegram link inside the Telegram app. The function expects passing a link in a full
 * format using the hostname "t.me".
 *
 * The Mini App will be closed.
 * @param url - URL to be opened.
 * @example
 * openTelegramLink('https://t.me/heyqbnk');
 */
export const openTelegramLinkFp = instantiate();

/**
 * @see openTelegramLinkFp
 */
export const openTelegramLink = throwifyWithChecksFp(openTelegramLinkFp);
