import type { OpenLinkBrowser, PostEventError } from '@tma.js/bridge';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

import { InvalidArgumentsError } from '@/errors.js';
import {
  type SharedFeatureOptions,
  sharedFeatureOptions,
} from '@/fn-options/sharedFeatureOptions.js';
import { type WithPostEvent, withPostEvent } from '@/fn-options/withPostEvent.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import { withChecksFp } from '@/with-checks/withChecksFp.js';

interface CreateOptions extends SharedFeatureOptions, WithPostEvent {
}

export interface OpenLinkOptions {
  /**
   * Attempts to use the instant view mode.
   */
  tryInstantView?: boolean;
  /**
   * A preferred browser to open the link in.
   */
  tryBrowser?: OpenLinkBrowser;
}

export type OpenLinkError = PostEventError | InvalidArgumentsError;

function create({ postEvent, ...rest }: CreateOptions) {
  return withChecksFp((
    url: string | URL,
    options: OpenLinkOptions = {},
  ): E.Either<OpenLinkError, void> => {
    if (typeof url === 'string') {
      try {
        url = new URL(url);
      } catch (e) {
        return E.left(new InvalidArgumentsError(`"${url.toString()}" is invalid URL`, e));
      }
    }
    return postEvent('web_app_open_link', {
      url: url.toString(),
      try_browser: options.tryBrowser,
      try_instant_view: options.tryInstantView,
    });
  }, { ...rest, returns: 'either' });
}

// #__NO_SIDE_EFFECTS__
function instantiate() {
  return create(pipe(sharedFeatureOptions(), withPostEvent));
}

/**
 * Opens a link.
 *
 * The Mini App will not be closed.
 *
 * Note that this method can be called only in response to the user
 * interaction with the Mini App interface (e.g. click inside the Mini App or on the main button).
 * @param url - URL to be opened.
 * @param options - additional options.
 * @example
 * openLink('https://google.com', {
 *   tryInstantView: true,
 *   tryBrowser: 'chrome',
 * });
 */
export const openLinkFp = instantiate();

export const openLink = throwifyWithChecksFp(openLinkFp);
