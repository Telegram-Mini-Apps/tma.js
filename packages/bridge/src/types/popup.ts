/**
 * Describes the native popup.
 */
export interface PopupParams {
  /**
   * List of buttons to be displayed in the popup, 1-3 buttons.
   */
  buttons: PopupButton[];
  /**
   * The message to be displayed in the body of the popup, 1-256 characters.
   */
  message: string;
  /**
   * The text to be displayed in the popup title, 0-64 characters.
   */
  title: string;
}

/**
 * Describes the native popup button.
 * @see https://docs.telegram-mini-apps.com/platform/methods#popupbutton
 */
export type PopupButton = {
  /**
   * Identifier of the button, 0-64 characters.
   */
  id: string;
} & ({
  /**
   * The text to be displayed on the button, 0-64 characters.
   */
  text: string;
  /**
   * Type of the button:
   * - `default`, a button with the default style;
   * - `destructive`, a button with a style that indicates a destructive
   * action (e.g. "Remove", "Delete", etc.).
   */
  type: 'default' | 'destructive';
} | {
  /**
   * Type of the button:
   * - `ok`, a button with the localized text "OK";
   * - `close`, a button with the localized text "Close";
   * - `cancel`, a button with the localized text "Cancel".
   */
  type: 'ok' | 'close' | 'cancel';
});
