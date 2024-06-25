import { captureSameReq } from '@/bridge/utils/captureSameReq.js';
import { request } from '@/bridge/utils/request.js';
import { WithSupports } from '@/classes/WithSupports.js';
import { createSupportsParamFn } from '@/supports/createSupportsParamFn.js';
import { supports } from '@/supports/supports.js';
import type { PostEvent } from '@/bridge/methods/postEvent.js';
import type { CreateRequestIdFn } from '@/request-id/types.js';
import type { SupportsFn } from '@/supports/types.js';
import type { Version } from '@/version/types.js';

/**
 * @see API: https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/components/utils
 */
export class Utils extends WithSupports<'readTextFromClipboard'> {
  constructor(
    private readonly version: Version,
    private readonly createRequestId: CreateRequestIdFn,
    private readonly postEvent: PostEvent,
  ) {
    super(version, { readTextFromClipboard: 'web_app_read_text_from_clipboard' });

    this.supportsParam = createSupportsParamFn(version, {
      'openLink.tryInstantView': ['web_app_open_link', 'try_instant_view'],
    });
  }

  /**
   * Opens a link in an external browser. The Mini App will not be closed.
   *
   * Note that this method can be called only in response to the user
   * interaction with the Mini App interface (e.g. click inside the Mini App
   * or on the main button).
   * @param url - URL to be opened.
   * @param tryInstantView
   */
  openLink(url: string, tryInstantView?: boolean): void {
    const formattedUrl = new URL(url, window.location.href).toString();

    // If method is not supported, we are doing it in legacy way.
    if (!supports('web_app_open_link', this.version)) {
      window.open(formattedUrl, '_blank');
      return;
    }

    // Otherwise, do it normally.
    this.postEvent('web_app_open_link', {
      url: formattedUrl,
      ...(typeof tryInstantView === 'boolean' ? { try_instant_view: tryInstantView } : {}),
    });
  }

  /**
   * Opens a Telegram link inside Telegram app. The Mini App will be closed. It expects passing
   * link in full format, with hostname "t.me".
   * @param url - URL to be opened.
   * @throws {Error} URL has not allowed hostname.
   */
  openTelegramLink(url: string): void {
    const { hostname, pathname, search } = new URL(url, 'https://t.me');
    if (hostname !== 't.me') {
      throw new Error(`URL has not allowed hostname: ${hostname}. Only "t.me" is allowed`);
    }

    if (!supports('web_app_open_tg_link', this.version)) {
      window.location.href = url;
      return;
    }

    this.postEvent('web_app_open_tg_link', { path_full: pathname + search });
  }

  /**
   * Reads text from clipboard and returns string or null. null is returned
   * in cases:
   * - Value in clipboard is not text
   * - Access to clipboard is not allowed
   */
  async readTextFromClipboard(): Promise<string | null> {
    const reqId = this.createRequestId();
    const {
      data = null,
    } = await request({
      method: 'web_app_read_text_from_clipboard',
      event: 'clipboard_text_received',
      postEvent: this.postEvent,
      params: { req_id: reqId },
      capture: captureSameReq(reqId),
    });

    return data;
  }

  /**
   * Shares specified URL with the passed to the chats, selected by user. After being called,
   * it closes the mini application.
   *
   * This method uses Telegram's Share Links.
   * @param url - URL to share.
   * @param text - text to append after the URL.
   * @see https://core.telegram.org/api/links#share-links
   * @see https://core.telegram.org/widgets/share#custom-buttons
   */
  shareURL(url: string, text?: string): void {
    this.openTelegramLink(
      'https://t.me/share/url?' + new URLSearchParams({ url, text: text || '' }).toString(),
    );
  }

  /**
   * Checks if specified method parameter is supported by current component.
   */
  supportsParam: SupportsFn<'openLink.tryInstantView'>;
}
