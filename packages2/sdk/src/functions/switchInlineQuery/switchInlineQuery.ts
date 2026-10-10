import { type SwitchInlineQueryChatType } from '@tma.js/bridge';

import { InvalidEnvError } from '../../errors.js';
import { getGlobals, isMethodSupported, requireMethod } from '../../globals.js';
import { withIsSupported } from '../../is-supported.js';

function isSwitchInlineQuerySupported(): boolean {
  return isMethodSupported('web_app_switch_inline_query')
    && !!getGlobals().launchParams.tgWebAppBotInline;
}

/**
 * Asks the user to choose a chat, opens it and inserts the bot's username and the query into
 * the input field.
 * @param query - query to insert, 0-256 characters.
 * @param chatTypes - chat types the user can choose from. All types are allowed if empty.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @throws {InvalidEnvError} The mini app was not launched in inline mode.
 * @since Mini Apps v6.7
 */
export const switchInlineQuery = /* @__PURE__ */ withIsSupported(
  function(
    query: string,
    chatTypes: SwitchInlineQueryChatType[] = [],
  ): void {
    const { postEvent, launchParams } = requireMethod('web_app_switch_inline_query');
    if (!launchParams.tgWebAppBotInline) {
      throw new InvalidEnvError('The mini app must be launched in inline mode');
    }
    postEvent('web_app_switch_inline_query', { query, chat_types: chatTypes });
  },
  isSwitchInlineQuerySupported,
);
