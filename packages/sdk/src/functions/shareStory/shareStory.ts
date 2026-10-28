import { isMethodSupported, requireMethod } from '../../globals.js';
import { withIsSupported } from '../../is-supported.js';

export interface ShareStoryOptions {
  /**
   * Media caption, 0-200 characters for regular users and 0-2048 characters for premium
   * subscribers.
   */
  text?: string;
  /**
   * Link added to the story. Only premium subscribers can post stories with links.
   */
  widgetLink?: {
    /**
     * Link name, 0-48 characters.
     */
    name?: string;
    url: string;
  };
}

/**
 * Opens the native story editor.
 * @param mediaUrl - URL of the media to share.
 * @param options - additional options.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @since Mini Apps v7.8
 * @example
 * shareStory('https://example.com/background.png', {
 *   text: 'Look at this!',
 *   widgetLink: { url: 'https://t.me/heyqbnk', name: 'Community' },
 * });
 */
export const shareStory = /* @__PURE__ */ withIsSupported(
  function(mediaUrl: string, options: ShareStoryOptions = {}): void {
    requireMethod('web_app_share_to_story').postEvent('web_app_share_to_story', {
      media_url: mediaUrl,
      text: options.text,
      widget_link: options.widgetLink,
    });
  },
  () => isMethodSupported('web_app_share_to_story'),
);
