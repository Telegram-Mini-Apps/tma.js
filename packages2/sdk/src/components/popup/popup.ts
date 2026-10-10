import {
  err,
  ok,
  type PopupButton,
  type PopupParams,
  type Result,
  safeRequest,
  throwing,
  type TimeoutError,
} from '@tma.js/bridge';

import { ConcurrentCallError, InvalidArgumentsError } from '../../errors.js';
import { isMethodSupported, requireMethod } from '../../globals.js';
import { createStore } from '../../store.js';
import type { AsyncOptions } from '../../types.js';

/**
 * Popup button.
 * @see https://core.telegram.org/bots/webapps#popupbutton
 */
export type PopupShowButton = {
  /**
   * Button identifier, 0-64 characters. It is returned when the button is pressed.
   * @default ""
   */
  id?: string;
} & (
  | {
    /**
     * Button type:
     * - `default`, a button with the default style;
     * - `destructive`, a button with a style indicating a destructive action, e.g. "Delete".
     * @default "default"
     */
    type?: 'default' | 'destructive';
    /**
     * Button text, 1-64 characters.
     */
    text: string;
  }
  | {
    /**
     * Button with a localized text: "OK", "Close" or "Cancel".
     */
    type: 'ok' | 'close' | 'cancel';
  }
);

/**
 * @see https://core.telegram.org/bots/webapps#popupparams
 */
export interface PopupShowOptions extends AsyncOptions {
  /**
   * Popup title, 0-64 characters.
   * @default ""
   */
  title?: string;
  /**
   * Popup message, 1-256 characters.
   */
  message: string;
  /**
   * Popup buttons, 1-3 buttons.
   * @default [{ type: 'close' }]
   */
  buttons?: PopupShowButton[];
}

/**
 * @since Mini Apps v6.2
 */
export interface Popup {
  /**
   * @returns True if the SDK is initialized and popups are supported.
   */
  isSupported: () => boolean;
  /**
   * @returns True if a popup is opened.
   */
  isOpened: () => boolean;
  /**
   * Subscribes to the `isOpened` value changes.
   * @param listener - function to call on changes.
   * @returns Function removing the listener.
   */
  subscribe: (listener: VoidFunction) => VoidFunction;
  /**
   * Shows a native popup and waits until it is closed.
   * @param options - popup parameters and additional options.
   * @returns Identifier of the pressed button, or `undefined` if the popup was closed without
   * pressing a button. `InvalidArgumentsError` if the popup parameters are invalid, or
   * `TimeoutError` if the popup was not closed in time.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {MethodUnsupportedError} Popups are unsupported.
   * @throws {ConcurrentCallError} A popup is already opened.
   * @example
   * const result = await popup.safeShow({
   *   title: 'Delete',
   *   message: 'Are you sure?',
   *   buttons: [{ id: 'yes', type: 'destructive', text: 'Yes' }, { type: 'cancel' }],
   * });
   */
  safeShow: (
    options: PopupShowOptions,
  ) => Promise<Result<InvalidArgumentsError | TimeoutError, string | undefined>>;
  /**
   * Throwing version of `safeShow`.
   * @throws {InvalidArgumentsError} The popup parameters are invalid.
   * @throws {TimeoutError} The popup was not closed in time.
   */
  show: (options: PopupShowOptions) => Promise<string | undefined>;
}

/**
 * Validates popup parameters and converts them to the method parameters.
 * @param options - popup parameters.
 * @returns Method parameters, or `InvalidArgumentsError` if the parameters are invalid.
 */
export function preparePopupParams(
  options: PopupShowOptions,
): Result<InvalidArgumentsError, PopupParams> {
  const message = options.message.trim();
  const title = (options.title || '').trim();
  const optionsButtons = options.buttons || [];

  if (title.length > 64) {
    return err(new InvalidArgumentsError(`Invalid title: ${title}`));
  }
  if (!message || message.length > 256) {
    return err(new InvalidArgumentsError(`Invalid message: ${message}`));
  }
  if (optionsButtons.length > 3) {
    return err(new InvalidArgumentsError(`Invalid buttons count: ${optionsButtons.length}`));
  }

  const buttons: PopupButton[] = [];
  for (const [index, button] of optionsButtons.entries()) {
    const id = button.id || '';
    if (id.length > 64) {
      return err(new InvalidArgumentsError(`Button with index ${index} has invalid id: ${id}`));
    }
    if (!button.type || button.type === 'default' || button.type === 'destructive') {
      const text = button.text.trim();
      if (!text || text.length > 64) {
        return err(new InvalidArgumentsError(
          `Button with index ${index} has invalid text: ${text}`,
        ));
      }
      buttons.push({ type: button.type || 'default', text, id });
    } else {
      buttons.push({ type: button.type, id });
    }
  }
  buttons.length || buttons.push({ type: 'close', id: '' });

  return ok({ title, message, buttons });
}

const METHOD = 'web_app_open_popup';

/**
 * @internal
 */
export function createPopup(): Popup {
  const isOpened = createStore(false);

  const safeShow: Popup['safeShow'] = async ({ title, message, buttons, ...options }) => {
    const { postEvent } = requireMethod(METHOD);
    if (isOpened.get()) {
      throw new ConcurrentCallError('A popup is already opened');
    }
    const params = preparePopupParams({ title, message, buttons });
    if (!params.ok) {
      return params;
    }
    isOpened.set(true);
    try {
      const response = await safeRequest(METHOD, 'popup_closed', {
        ...options,
        params: params.data,
        postEvent,
      });
      return response.ok ? ok(response.data.button_id) : response;
    } finally {
      isOpened.set(false);
    }
  };

  return {
    isSupported: () => isMethodSupported(METHOD),
    isOpened: isOpened.get,
    subscribe: isOpened.subscribe,
    safeShow,
    show: throwing(safeShow),
  };
}

/**
 * Native popups.
 * @since Mini Apps v6.2
 */
export const popup = /* @__PURE__ */ createPopup();
