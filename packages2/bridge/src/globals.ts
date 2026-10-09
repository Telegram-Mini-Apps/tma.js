/**
 * Window properties used by the Telegram clients and the official SDK to communicate with
 * a mini app.
 */
export interface TelegramWindow {
  /**
   * Telegram for iOS, macOS, Android and Telegram Desktop.
   */
  TelegramWebviewProxy?: {
    postEvent: (eventType: string, eventData: string) => void;
  };
  /**
   * Telegram for Windows Phone.
   */
  external?: {
    notify?: (message: string) => void;
  };
  Telegram?: {
    WebView?: {
      receiveEvent?: ReceiveEventFn;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  TelegramGameProxy?: {
    receiveEvent?: ReceiveEventFn;
    [key: string]: unknown;
  };
  TelegramGameProxy_receiveEvent?: ReceiveEventFn;
}

export type ReceiveEventFn = (eventType: string, eventData?: unknown) => void;

/**
 * @returns The current window with Telegram-specific properties typed.
 */
export function telegramWindow(): Window & TelegramWindow {
  return window;
}
