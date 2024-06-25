import { request } from '@/bridge/utils/request.js';
import { WithSupportsAndTrackableState } from '@/classes/WithSupportsAndTrackableState.js';
import type { PostEvent } from '@/bridge/methods/postEvent.js';
import type { Version } from '@/version/types.js';

import { QRScannerOpenOptions, QRScannerState } from './types.js';

// TODO: Usage

/**
 * @see API: https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/components/qr-scanner
 */
export class QRScanner extends WithSupportsAndTrackableState<QRScannerState, 'close' | 'open'> {
  constructor(isOpened: boolean, version: Version, private readonly postEvent: PostEvent) {
    super({ isOpened }, version, {
      close: 'web_app_close_scan_qr_popup',
      open: 'web_app_open_scan_qr_popup',
    });
  }

  /**
   * Closes scanner.
   */
  close(): void {
    this.postEvent('web_app_close_scan_qr_popup');
    this.isOpened = false;
  }

  private set isOpened(value) {
    this.set('isOpened', value);
  }

  /**
   * Returns true in case, QR scanner is currently opened.
   */
  get isOpened(): boolean {
    return this.get('isOpened');
  }

  /**
   * Opens scanner with specified title shown to user. Method returns promise
   * with scanned QR content in case, it was scanned. It will contain null in
   * case, scanner was closed.
   * @param options - method options.
   */
  async open(options?: QRScannerOpenOptions): Promise<string | null>;
  /**
   * Opens scanner with specified title shown to user. Method returns promise
   * with scanned QR content in case, it was scanned. It will contain null in
   * case, scanner was closed.
   * @param text - title to display.
   */
  async open(text?: string): Promise<string | null>;
  async open(textOrOptions?: QRScannerOpenOptions | string): Promise<string | null> {
    if (this.isOpened) {
      throw new Error('QR scanner is already opened.');
    }

    const { text, capture }: QRScannerOpenOptions = (
      typeof textOrOptions === 'string'
        ? { text: textOrOptions }
        : textOrOptions
    ) || {};
    this.isOpened = true;

    try {
      const result = await request({
        method: 'web_app_open_scan_qr_popup',
        event: ['qr_text_received', 'scan_qr_popup_closed'],
        postEvent: this.postEvent,
        params: { text },
        capture(ev) {
          return ev.event === 'scan_qr_popup_closed' || !capture || capture(ev.payload);
        },
      }) || {};

      const qr = result.data || null;
      if (qr) {
        this.close();
      }
      return qr;
    } catch(e) {
      this.isOpened = false;
      throw e;
    }
  }
}
