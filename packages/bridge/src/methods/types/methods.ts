import type { If, IsNever } from '@tma.js/toolkit';
import type { RGB } from '@tma.js/types';

import type { AnyInvokeCustomMethodParams } from './custom-method.js';
import type { AnyHapticFeedbackParams } from './haptic-feedback.js';
import {
  BackgroundColor,
  BottomBarColor,
  HeaderColorKey,
  OpenLinkBrowser,
  SecondaryButtonPosition,
  SwitchInlineQueryChatType,
} from './misc.js';
import type { PopupParams } from './popup.js';
import type { CreateMethodParams } from './utils.js';

type WithReqId<T = {}> = T & {
  /**
   * Unique request identifier. Should be any unique string to handle the generated event
   * appropriately.
   */
  req_id: string;
};

interface ButtonParams {
  /**
   * Should the button shine.
   * @since 7.10
   */
  has_shine_effect?: boolean;
  /**
   * The ID of custom emoji icon displayed alongside button text.
   * @since 9.5
   */
  icon_custom_emoji_id?: string;
  /**
   * Should the button be displayed.
   */
  is_visible?: boolean;
  /**
   * Should the button be enabled.
   */
  is_active?: boolean;
  /**
   * Should loader inside the button be displayed. Use this property in case, some
   * operation takes time. This loader will make user notified about it.
   */
  is_progress_visible?: boolean;
  /**
   * Text inside the button.
   */
  text?: string;
  /**
   * The button background color in `#RRGGBB` format.
   */
  color?: RGB;
  /**
   * The Main Button text color in `#RRGGBB` format.
   */
  text_color?: RGB;
}

/**
 * Describes a list of events and their parameters that could be posted.
 * @see https://docs.telegram-mini-apps.com/platform/methods
 */
export interface Methods {
  /**
   * Notifies parent iframe about the current frame is ready. This method is only used in the Web
   * version of Telegram. As a result, Mini App will receive `set_custom_style` event.
   * @see https://docs.telegram-mini-apps.com/platform/methods#iframe-ready
   */
  iframe_ready: CreateMethodParams<{
    /**
     * True, if the current Mini App supports native reloading.
     */
    reload_supported?: boolean;
  } | undefined>;
  /**
   * Notifies parent iframe about the current iframe is going to reload.
   * @see https://docs.telegram-mini-apps.com/platform/methods#iframe-will-reload
   */
  iframe_will_reload: CreateMethodParams;
  /**
   * Prompts the user to add the Mini App to the home screen. Note that if the device cannot
   * determine the installation status, the event may not be received even if the icon has
   * been added.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-add-to-home-screen
   */
  web_app_add_to_home_screen: CreateMethodParams;
  /**
   * Emitted by bot mini apps to ask the client to initialize the biometric authentication manager
   * object for the current bot, emitting a `biometry_info_received` event on completion.
   *
   * This request should just initialize the client-side state, i.e. by checking if biometric
   * authentication is even available or not, it should not ask the user anything.
   * @since v7.2
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-biometry-get-info
   */
  web_app_biometry_get_info: CreateMethodParams;
  /**
   * Opens the biometric access settings for bots. Useful when you need to request biometrics
   * access to users who haven't granted it yet.
   *
   * _Note that this method can be called only in response to user interaction with the Mini
   * App interface (e.g. a click inside the Mini App or on the main button)_.
   * @since v7.2
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-biometry-open-settings
   */
  web_app_biometry_open_settings: CreateMethodParams;
  /**
   * Emitted by bot mini apps to ask the user permission to use biometric authentication,
   * emitting a `biometry_info_received` event on completion.
   *
   * This request should not actually prompt biometric authentication, it should just ask the
   * user permission to use them, and a popup should be shown only if the user hasn't already
   * allowed or denied the usage of biometric authentication for the bot associated with the
   * mini app.
   * @since v7.2
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-biometry-request-access
   */
  web_app_biometry_request_access: CreateMethodParams<{
    /**
     * Reason to request biometry access. Should be at least 1 symbol length, but not
     * more than 128 symbols.
     */
    reason?: string;
  }>;
  /**
   * Attempts to authenticate a user using biometrics and fetch a previously stored
   * secure token, emitting the `biometry_auth_requested` event on completion, containing either
   * an error, or a decrypted biometric token (or an empty string if no token was configured yet).
   *
   * Should only be used if the `token_saved` field of the `biometry_info_received` event object
   * is equal to true.
   *
   * If a user has previously disallowed the bot from using biometric authentication, this
   * request will immediately fail, emitting an appropriate `biometry_auth_requested` event.
   * @since v7.2
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-biometry-request-auth
   */
  web_app_biometry_request_auth: CreateMethodParams<{
    /**
     * Reason to request biometry data. Should be at least 1 symbol length, but not more than
     * 128 symbols.
     */
    reason?: string;
  }>;
  /**
   * Attempts to authenticate using biometrics and store the biometric token
   * securely on a device, emitting a `biometry_token_updated` event on completion.
   *
   * This token will be safely stored by the Telegram client and will be associated with the bot
   * that owns the mini app.
   *
   * If the user has previously disallowed the bot from using biometric authentication, this
   * request will immediately fail, emitting an appropriate biometry_token_updated event.
   * @since v7.2
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-biometry-update-token
   */
  web_app_biometry_update_token: CreateMethodParams<{
    /**
     * Optional string field, containing the reason why the bot is asking to authenticate using
     * biometrics (1-128 chars, used in the prompt).
     */
    reason?: string;
    /**
     * The new token (string, 0-1024 chars), or an empty string to remove it.
     */
    token: string;
  }>;
  /**
   * Sends a request to the native Telegram application to check if the current mini
   * application is added to the device's home screen.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-check-home-screen
   */
  web_app_check_home_screen: CreateMethodParams;
  /**
   * Requests location-related functionality availability state.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-check-location
   */
  web_app_check_location: CreateMethodParams;
  /**
   * Closes Mini App.
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-close
   */
  web_app_close: CreateMethodParams<{
    /**
     * Should the client return to the previous activity.
     * @since v7.6
     */
    return_back?: boolean;
  } | undefined, 'return_back'>;
  /**
   * Closes a QR scanner. The Telegram application creates `scan_qr_popup_closed` event.
   * @since v6.4
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-close-scan-qr-popup
   */
  web_app_close_scan_qr_popup: CreateMethodParams;
  /**
   * Sends data to the bot. When this method is called, a service message is sent to the bot
   * containing the data of the length up to 4096 bytes. Then, Mini App will be closed.
   *
   * To get more information, take a look at `web_app_data` field in the
   * class [Message](https://core.telegram.org/bots/api#message).
   *
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-data-send
   */
  web_app_data_send: CreateMethodParams<{
    /**
     * Data to send to a bot. Should not have size of more than 4096 bytes.
     */
    data: string;
  }>;
  /**
   * Clears all keys previously stored by the bot in the device's local storage.
   * @since 9.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-device-storage-clear
   */
  web_app_device_storage_clear: CreateMethodParams<WithReqId>;
  /**
   * Receives a value from the device's local storage using the specified key.
   * @since 9.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-device-storage-get-key
   */
  web_app_device_storage_get_key: CreateMethodParams<WithReqId<{
    /**
     * A key name to retrieve.
     */
    key: string;
  }>>;
  /**
   * Stores a value in the device's local storage using the specified key.
   * @since 9.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-device-storage-save-key
   */
  web_app_device_storage_save_key: CreateMethodParams<WithReqId<{
    /**
     * A key to use to store the value.
     */
    key: string;
    /**
     * A value to store for the specified key. Passing `null` will lead to the key removal.
     */
    value: string | null;
  }>>;
  /**
   * Exits fullscreen mode for miniapp.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-exit-fullscreen
   */
  web_app_exit_fullscreen: CreateMethodParams;
  /**
   * Expands the Mini App.
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-expand
   */
  web_app_expand: CreateMethodParams;
  /**
   * Hides the on-screen keyboard, if it is currently visible. Does nothing if the keyboard is
   * not active.
   * @since v9.1
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-hide-keyboard
   */
  web_app_hide_keyboard: CreateMethodParams;
  /**
   * Invokes custom method.
   * @since v6.9
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-invoke-custom-method
   */
  web_app_invoke_custom_method: CreateMethodParams<AnyInvokeCustomMethodParams>;
  /**
   * Opens an invoice by its specified slug. More information about invoices in
   * this [documentation](https://core.telegram.org/bots/payments).
   * @since v6.1
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-open-invoice
   */
  web_app_open_invoice: CreateMethodParams<{
    /**
     * Invoice unique identifier.
     */
    slug: string;
  }>;
  /**
   * Opens a link in a default browser. The Mini App will not be closed.
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-open-link
   */
  web_app_open_link: CreateMethodParams<{
    /**
     * URL to be opened by Telegram application. Should be a full path with `https` protocol.
     */
    url: string;
    /**
     * Link will be opened in Instant View mode if possible.
     * @since v6.4
     * @see https://instantview.telegram.org/
     */
    try_instant_view?: boolean;
    /**
     * A preferred browser to open the link in.
     * @since v7.6
     */
    try_browser?: OpenLinkBrowser;
  }, 'try_instant_view' | 'try_browser'>;
  /**
   * Opens the location access settings for bots. Useful when you need to request location access
   * from users who haven't granted it yet.
   *
   * Note that this method can be called only in response to user interaction with the Mini App
   * interface (e.g., a click inside the Mini App or on the main button).
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-open-location-settings
   */
  web_app_open_location_settings: CreateMethodParams;
  /**
   * Opens a new popup. When a user closes the popup, Telegram creates the `popup_closed` event.
   * @since v6.2
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-open-popup
   */
  web_app_open_popup: CreateMethodParams<PopupParams>;
  /**
   * Opens a QR scanner. When the scanner was closed, the Telegram application creates
   * the `scan_qr_popup_closed` event. When the scanner reads QR, Telegram creates the
   * `qr_text_received` event.
   * @since v6.4
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-open-scan-qr-popup
   */
  web_app_open_scan_qr_popup: CreateMethodParams<{
    /**
     * Text to be displayed in the QR scanner.
     */
    text?: string;
  }>;
  /**
   * Opens the Telegram link by its pathname and query parameters. The link will be opened in the
   * Telegram app, Mini App will be closed.
   * @since v6.1
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-open-tg-link
   */
  web_app_open_tg_link: CreateMethodParams<{
    /**
     * Should be a value taken from the link of this format: `https://t.me/{path_full}`. Can
     * additionally contain query parameters.
     */
    path_full: string;
  }>;
  /**
   * Reads text from the clipboard. The method accepts a request identifier which is used to
   * appropriately retrieve the method execution result from the `clipboard_text_received` event.
   * @since v6.4
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-read-text-from-clipboard
   */
  web_app_read_text_from_clipboard: CreateMethodParams<WithReqId>;
  /**
   * Notifies Telegram about current application is ready to be shown. This method will make
   * Telegram to remove application loader and display Mini App.
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-ready
   */
  web_app_ready: CreateMethodParams;
  /**
   * Requests content safe area of the user's phone.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-request-content-safe-area
   */
  web_app_request_content_safe_area: CreateMethodParams;
  /**
   * Shows a native popup requesting permission for the bot to manage user's emoji status.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-request-emoji-status-access
   */
  web_app_request_emoji_status_access: CreateMethodParams;
  /**
   * Displays a native popup prompting the user to download a file.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-request-file-download
   */
  web_app_request_file_download: CreateMethodParams<{
    /**
     * The HTTPS URL of the file to be downloaded.
     */
    url: string;
    /**
     * The suggested name for the downloaded file.
     */
    file_name: string;
  }>;
  /**
   * Requests to open the mini app in fullscreen.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-request-fullscreen
   */
  web_app_request_fullscreen: CreateMethodParams;
  /**
   * Requests location data.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-request-location
   */
  web_app_request_location: CreateMethodParams;
  /**
   * Requests access to current user's phone.
   * @since v6.9
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-request-phone
   */
  web_app_request_phone: CreateMethodParams;
  /**
   * Requests safe area of the user's phone.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-request-safe-area
   */
  web_app_request_safe_area: CreateMethodParams;
  /**
   * Requests current theme from Telegram. As a result, Telegram will create `theme_changed` event.
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-request-theme
   */
  web_app_request_theme: CreateMethodParams;
  /**
   * Requests current viewport information from Telegram. As a result, Telegram will create
   * `viewport_changed` event.
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-request-viewport
   */
  web_app_request_viewport: CreateMethodParams;
  /**
   * Requests write message access to the current user.
   * @since v6.9
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-rqeuest-write-access
   */
  web_app_request_write_access: CreateMethodParams;
  /**
   * Clears all keys previously stored by the bot in the device's secure storage.
   * @since 9.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-secure-storage-clear
   */
  web_app_secure_storage_clear: CreateMethodParams<WithReqId>;
  /**
   * Receives a value from the device's secure storage using the specified key.
   * @since 9.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-secure-storage-get-key
   */
  web_app_secure_storage_get_key: CreateMethodParams<WithReqId<{
    /**
     * A key to use to store the value.
     */
    key: string;
  }>>;
  /**
   * Attempts to restore a key that previously existed on the current device. When called, the user
   * will be asked for permission to restore the value.
   * @since 9.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-secure-storage-restore-key
   */
  web_app_secure_storage_restore_key: CreateMethodParams<WithReqId<{
    /**
     * A key to use to restore the value.
     */
    key: string;
  }>>;
  /**
   * Stores a value in the device's secure storage using the specified key.
   * @since 9.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-secure-storage-save-key
   */
  web_app_secure_storage_save_key: CreateMethodParams<WithReqId<{
    /**
     * A key to use to store the value.
     */
    key: string;
    /**
     * A value to store for the specified key. Passing `null` will lead to the key removal.
     */
    value: string | null;
  }>>;
  /**
   * Opens a dialog allowing the user to share a message provided by the bot.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-send-prepared-message
   */
  web_app_send_prepared_message: CreateMethodParams<{
    /**
     * Identifier of the message
     * ([PreparedInlineMessage](https://core.telegram.org/bots/api#preparedinlinemessage))
     * previously obtained via the Bot API method
     * [savePreparedInlineMessage](https://core.telegram.org/bots/api#savepreparedinlinemessage).
     */
    id: string;
  }>;
  /**
   * Updates the Mini App background color.
   * @since v6.1
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-set-background-color
   */
  web_app_set_background_color: CreateMethodParams<{
    /**
     * Color to set.
     */
    color: BackgroundColor;
  }>;
  /**
   * Updates the mini app bottom bar background color.
   * @since v7.10
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-set-bottom-bar-color
   */
  web_app_set_bottom_bar_color: CreateMethodParams<{
    /**
     * Color to set.
     */
    color: BottomBarColor;
  }>;
  /**
   * Opens a dialog allowing the user to set the specified custom emoji as their status.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-set-emoji-status
   */
  web_app_set_emoji_status: CreateMethodParams<{
    /**
     * Custom emoji identifier to set.
     */
    custom_emoji_id: string;
    /**
     * The status expiration time in seconds.
     */
    duration?: number;
  }>;
  /**
   * Updates the Mini App header color.
   * @since v6.1
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-set-header-color
   */
  web_app_set_header_color: CreateMethodParams<
    | {
    /**
     * The Mini App header color key.
     */
      color_key: HeaderColorKey;
    }
    | {
    /**
     * Color in RGB format.
     * @since v6.9
     */
      color: RGB;
    }, 'color'>;
  /**
   * Updates the Back Button settings.
   * @since v6.1
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-setup-back-button
   */
  web_app_setup_back_button: CreateMethodParams<{
    /**
     * Should the Back Button be visible.
     */
    is_visible: boolean;
  }>;
  /**
   * Updates current closing behavior.
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-setup-closing-behavior
   */
  web_app_setup_closing_behavior: CreateMethodParams<{
    /**
     * Will user be prompted in case, an application is going to be closed.
     */
    need_confirmation: boolean;
  }>;

  /**
   * Updates the Main Button settings.
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-setup-main-button
   */
  web_app_setup_main_button: CreateMethodParams<ButtonParams, 'has_shine_effect' | 'icon_custom_emoji_id'>;

  /**
   * Updates the secondary button settings.
   * @since v7.10
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-setup-secondary-button
   */
  web_app_setup_secondary_button: CreateMethodParams<ButtonParams & {
    /**
     * Position of the secondary button. It applies only if both the main and secondary buttons
     * are visible.
     *
     * Supported values:
     * - `left`, displayed to the left of the main button.
     * - `right`, displayed to the right of the main button.
     * - `top`, displayed above the main button.
     * - `bottom`, displayed below the main button.
     */
    position?: SecondaryButtonPosition;
  }, 'icon_custom_emoji_id'>;

  /**
   * Updates the current state of the Settings Button.
   * @since v6.10
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-setup-settings-button
   */
  web_app_setup_settings_button: CreateMethodParams<{
    /**
     * Should the Settings Button be displayed.
     */
    is_visible: boolean;
  }>;
  /**
   * Changes swipe behavior.
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-setup-swipe-behavior
   * @since v7.7
   */
  web_app_setup_swipe_behavior: CreateMethodParams<{
    allow_vertical_swipe: boolean;
  }>;

  /**
   * A method that opens the native story editor.
   * @since v7.8
   */
  web_app_share_to_story: CreateMethodParams<{
    /**
     * A media URL which will be used as a background for a created story.
     */
    media_url: string;
    /**
     * The caption to be added to the media.
     * 0-200 characters for regular users and 0-2048 characters for premium subscribers.
     * @see https://telegram.org/faq_premium#telegram-premium
     */
    text?: string;
    /**
     * An object that describes a widget link to be included in the story.
     * Note that only premium subscribers can post stories with links.
     * @see https://telegram.org/faq_premium#telegram-premium
     */
    widget_link?: {
      /**
       * The URL to be included in the story.
       */
      url: string;
      /**
       * The name to be displayed for the widget link, 0-48 characters.
       */
      name?: string;
    };
  }>;
  /**
   * Starts tracking accelerometer data.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-start-accelerometer
   */
  web_app_start_accelerometer: CreateMethodParams<{
    /**
     * The refresh rate in milliseconds, with acceptable values ranging from 20 to 1000.
     * Note that refresh_rate may not be supported on all platforms, so the actual tracking
     * frequency may differ from the specified value.
     */
    refresh_rate: number;
  }>;
  /**
   * Starts tracking device orientation data.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-start-device-orientation
   */
  web_app_start_device_orientation: CreateMethodParams<{
    /**
     * The refresh rate in milliseconds, with acceptable values ranging from 20 to 1000.
     * Note that refresh_rate may not be supported on all platforms, so the actual tracking
     * frequency may differ from the specified value.
     */
    refresh_rate: number;
    /**
     * Pass true to receive absolute orientation data, allowing you to determine the device's
     * attitude relative to magnetic north. Use this option if implementing features like a
     * compass in your app. If relative data is sufficient, pass false.
     *
     * Keep in mind that some devices may not support absolute orientation data. In such cases,
     * you will receive relative data even if need_absolute=true is passed.
     */
    need_absolute?: boolean;
  }>;

  /**
   * Starts tracking gyroscope data.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-start-gyroscope
   */
  web_app_start_gyroscope: CreateMethodParams<{
    /**
     * The refresh rate in milliseconds, with acceptable values ranging from 20 to 1000.
     * Note that refresh_rate may not be supported on all platforms, so the actual tracking
     * frequency may differ from the specified value.
     */
    refresh_rate: number;
  }>;
  /**
   * Stops tracking accelerometer data.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-stop-accelerometer
   */
  web_app_stop_accelerometer: CreateMethodParams;
  /**
   * Stops tracking device orientation data.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-stop-device-orientation
   */
  web_app_stop_device_orientation: CreateMethodParams;

  /**
   * Stops tracking gyroscope data.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-stop-gyroscope
   */
  web_app_stop_gyroscope: CreateMethodParams;
  /**
   * Inserts the bot's username and the specified inline query in the current chat's input field.
   * Query may be empty, in which case only the bot's username will be inserted. The client prompts
   * the user to choose a specific chat, then opens that chat and inserts the bot's username and
   * the specified inline query in the input field.
   * @since v6.7
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-switch-inline-query
   */
  web_app_switch_inline_query: CreateMethodParams<{
    /**
     * Text which should be inserted in the input after the current bot name. Max length is
     * 256 symbols.
     */
    query: string;
    /**
     * List of chat types which could be chosen to send the message. Could be empty list.
     */
    chat_types: SwitchInlineQueryChatType[];
  }>;
  /**
   * Locks the Mini App’s orientation to its current mode (either portrait or landscape). Once
   * locked, the orientation remains fixed, regardless of device rotation. This is useful if a
   * stable orientation is needed during specific interactions.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-toggle-orientation-lock
   */
  web_app_toggle_orientation_lock: CreateMethodParams<{ locked: boolean }>;
  /**
   * Generates haptic feedback event.
   * @since v6.1
   * @see https://docs.telegram-mini-apps.com/platform/methods#web-app-trigger-haptic-feedback
   */
  web_app_trigger_haptic_feedback: CreateMethodParams<AnyHapticFeedbackParams>;
}

/**
 * Mini Apps method name.
 */
export type MethodName = keyof Methods;

/**
 * Parameters of the specified Mini Apps method.
 */
export type MethodParams<M extends MethodName> = Methods[M]['params'];

/**
 * Methods with optional parameters.
 */
export type MethodNameWithOptionalParams = {
  [M in MethodName]: undefined extends MethodParams<M>
    ? M
    : never;
}[MethodName];

/**
 * Methods without parameters.
 */
export type MethodNameWithoutParams = {
  [M in MethodName]: If<IsNever<MethodParams<M>>, M, never>;
}[MethodName];

/**
 * Methods with parameters.
 */
export type MethodNameWithRequiredParams = Exclude<
  MethodName,
  MethodNameWithoutParams | MethodNameWithOptionalParams
>;

/**
 * Method names which have versioned params.
 */
export type MethodNameWithVersionedParams = {
  [M in MethodName]: If<IsNever<Methods[M]['versionedParams']>, never, M>;
}[MethodName];

/**
 * Method parameters which appear only in the specific Telegram Mini Apps version.
 */
export type MethodVersionedParams<M extends MethodNameWithVersionedParams> =
  Methods[M]['versionedParams'];
