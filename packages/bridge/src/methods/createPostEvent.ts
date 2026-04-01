import type { Version } from '@tma.js/types';
import { any, is, looseObject } from 'valibot';

import { MethodParameterUnsupportedError, MethodUnsupportedError } from '@/errors.js';
import { logger } from '@/globals.js';
import { type PostEventFn, postEvent } from '@/methods/postEvent.js';
import { supports } from '@/methods/supports.js';
import type {
  MethodName,
  MethodNameWithVersionedParams,
  MethodVersionedParams,
} from '@/methods/types/index.js';

export type OnUnsupportedFn = (
  data: { version: Version } & (
    | { method: MethodName }
    | {
      [M in MethodNameWithVersionedParams]: {
        method: M;
        param: MethodVersionedParams<M>;
      };
    }[MethodNameWithVersionedParams]),
) => void;

export type CreatePostEventMode = 'strict' | 'non-strict';

/**
 * Creates a function that checks if the specified method and parameters are supported.
 *
 * If the method or parameters are unsupported, the `onUnsupported` function will be called.
 *
 * If `strict` or `non-strict` value was passed as the second argument, the function
 * will create its own `onUnsupported` function with behavior depending on the value passed.
 *
 * - Passing `strict` will make the function to throw a `MethodParameterUnsupportedError`
 * or a `MethodUnsupportedError` error.
 * - Passing `non-strict` will just warn you about something being unsupported.
 *
 * @param version - Telegram Mini Apps version.
 * @param onUnsupportedOrMode - function or strict mode. Default: `strict`
 */
export function createPostEvent(
  version: Version,
  onUnsupportedOrMode: OnUnsupportedFn | CreatePostEventMode = 'strict',
): PostEventFn {
  const onUnsupported: OnUnsupportedFn = typeof onUnsupportedOrMode === 'function'
    ? onUnsupportedOrMode
    : data => {
      const { method, version } = data;
      const error = 'param' in data
        ? new MethodParameterUnsupportedError(method, data.param, version)
        : new MethodUnsupportedError(method, version);

      if (onUnsupportedOrMode === 'strict') {
        throw error;
      }
      return logger().forceWarn(error.message);
    };

  return ((method: any, params: any) => {
    // Firstly, check if the method is supported.
    if (!supports(method, version)) {
      return onUnsupported({ version, method });
    }

    // Method could use parameters, which are supported only in specific versions of Mini Apps.
    // We are validating only those parameters, which are not backward compatible.
    if (
      method === 'web_app_set_header_color'
      && is(looseObject({ color: any() }), params)
      && !supports(method, 'color', version)
    ) {
      return onUnsupported({ version, method, param: 'color' });
    }
    if (
      (method === 'web_app_setup_main_button' || method === 'web_app_setup_secondary_button')
      && is(looseObject({ icon_custom_emoji_id: any() }), params)
      && !supports(method, 'icon_custom_emoji_id', version)
    ) {
      return onUnsupported({ version, method, param: 'icon_custom_emoji_id' });
    }

    return postEvent(method, params);
  }) as PostEventFn;
}
