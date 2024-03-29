import { parseThemeParams } from './parseThemeParams.js';
import type { ThemeParamsParsed } from './types.js';
import type { RequestSimpleOptions } from '../../bridge/request.js';
import { request } from '../../bridge/request.js';

/**
 * Requests current theme parameters from the Telegram application.
 * @param options - request options.
 */
export function requestThemeParams(
  options?: RequestSimpleOptions<'web_app_request_theme'>,
): Promise<ThemeParamsParsed> {
  return request('web_app_request_theme', 'theme_changed', options).then(parseThemeParams);
}
