import { captureSameReq, type RequestError } from '@tma.js/bridge';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import {
  sharedFeatureOptions,
  type SharedFeatureOptions,
} from '@/fn-options/sharedFeatureOptions.js';
import { withRequest, type WithRequest } from '@/fn-options/withRequest.js';
import { withVersion, type WithVersion } from '@/fn-options/withVersion.js';
import { createRequestId } from '@/globals/createRequestId.js';
import type { AsyncOptions } from '@/types.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import { withChecksFp } from '@/with-checks/withChecksFp.js';

interface CreateOptions extends SharedFeatureOptions, WithVersion, WithRequest {
  createRequestId: () => string;
}

export type ReadTextFromClipboardError = RequestError;

function create({ request, createRequestId, ...rest }: CreateOptions) {
  return withChecksFp((
    options?: AsyncOptions,
  ): TE.TaskEither<ReadTextFromClipboardError, string | null> => {
    const reqId = createRequestId();
    return pipe(
      request('web_app_read_text_from_clipboard', 'clipboard_text_received', {
        ...options,
        params: { req_id: reqId },
        capture: captureSameReq(reqId),
      }),
      TE.map(({ data = null }) => data),
    );
  }, { ...rest, requires: 'web_app_read_text_from_clipboard', returns: 'task' });
}

// #__NO_SIDE_EFFECTS__
function instantiate() {
  return create({
    ...pipe(
      sharedFeatureOptions(),
      withVersion,
      withRequest,
    ),
    createRequestId,
  });
}

/**
 * Reads a text from the clipboard and returns a `string` or `null`. `null` is returned
 * in one of the following cases:
 * - A value in the clipboard is not a text.
 * - Access to the clipboard is not granted.
 * @since Mini Apps v6.4
 */
export const readTextFromClipboardFp = instantiate();

export const readTextFromClipboard = throwifyWithChecksFp(readTextFromClipboardFp);
