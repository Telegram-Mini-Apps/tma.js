import type { If, IsNever, Maybe } from '@tma.js/toolkit';
import type { RGB } from '@tma.js/types';

import type {
  BiometryAuthRequestStatus,
  BiometryTokenUpdateStatus,
  BiometryType,
  EmojiStatusAccessRequestedStatus,
  EmojiStatusFailedError,
  FullScreenErrorStatus,
  HomeScreenStatus,
  InvoiceStatus,
  PhoneRequestedStatus,
  SafeAreaInsets,
  WriteAccessRequestedStatus,
} from './misc.js';

type WithReqId<T = {}> = T & {
  /**
   * Unique request identifier.
   */
  req_id: string;
};

/**
 * Map where key is known event name, and value is its listener.
 * @see https://docs.telegram-mini-apps.com/platform/events
 */
export interface Events {
  /**
   * Accelerometer data changed.
   * @since 8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#accelerometer-changed
   */
  accelerometer_changed: {
    /**
     * The current acceleration in the X-axis, measured in m/s².
     */
    x: number;
    /**
     * The current acceleration in the Y-axis, measured in m/s².
     */
    y: number;
    /**
     * The current acceleration in the Z-axis, measured in m/s².
     */
    z: number;
  };
  /**
   * Failed to start accelerometer data tracking.
   * @since 8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#accelerometer-failed
   */
  accelerometer_failed: {
    /**
     * Occurred error.
     */
    error: string;
  };
  /**
   * Accelerometer data tracking started.
   * @since 8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#accelerometer-started
   */
  accelerometer_started: never;
  /**
   * Accelerometer data tracking stopped.
   * @since 8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#accelerometer-stopped
   */
  accelerometer_stopped: never;
  /**
   * User clicked the BackButton.
   * @since v6.1
   * @see https://docs.telegram-mini-apps.com/platform/events#back-button-pressed
   */
  back_button_pressed: never;
  /**
   * Biometry authentication request completed.
   * @since 7.2
   * @see https://docs.telegram-mini-apps.com/platform/events#biometry-auth-requested
   */
  biometry_auth_requested: {
    /**
     * Authentication status.
     */
    status: BiometryAuthRequestStatus;
    /**
     * Token from the local secure storage saved previously.
     */
    token?: string;
  };
  /**
   * Biometry settings were received.
   * @since 7.2
   * @see https://docs.telegram-mini-apps.com/platform/events#biometry-info-received
   */
  biometry_info_received:
    | {
    /**
     * If true, indicates that biometric authentication is available on the
     * current device.
     */
      available: false;
    }
    | {
    /**
     * If true, indicates that biometric authentication is available on the
     * current device.
     */
      available: true;
      /**
     * Indicates whether the app has previously requested permission to use
     * biometrics.
     */
      access_requested: boolean;
      /**
     * Indicates whether the user has granted the app permission to use
     * biometrics.
     *
     * If false and access_requested is true may indicate that:
     *
     * - The user has simply canceled the permission popup, in which case
     * a `web_app_biometry_request_access` event can be emitted to re-open the
     * popup.
     *
     * - The user has denied the app permission to use biometrics, in which
     * case the app should open a prompt notifying the user that the biometric
     * settings must be changed to use biometrics.
     */
      access_granted: boolean;
      /**
     * A unique device identifier that can be used to match the token to the
     * device.
     */
      device_id: string;
      /**
     * Show whether a token was safely stored on-device.
     */
      token_saved: boolean;
      /**
     * The type of biometrics currently available on the device.
     */
      type: BiometryType;
    };
  /**
   * Biometry token was updated.
   * @since 7.2
   * @see https://docs.telegram-mini-apps.com/platform/events#biometry-token-updated
   */
  biometry_token_updated: {
    /**
     * Update status.
     *
     * One of:
     * - `updated` - If the token was successfully updated.
     * - `removed` - If the token was successfully removed.
     * - `failed` - If biometric authentication failed, or the app doesn't have
     * permission to use biometrics.
     */
    status: BiometryTokenUpdateStatus;
  };
  /**
   * Telegram application attempted to extract text from clipboard.
   * @since v6.4
   * @see https://docs.telegram-mini-apps.com/platform/events#clipboard-text-received
   */
  clipboard_text_received: WithReqId<{
    /**
     * Data extracted from the clipboard. The returned value will have the type
     * `string` only in the case, application has access to the clipboard.
     */
    data?: string | null;
  }>;
  /**
   * Occurs when the safe area for content changes
   * (e.g., due to orientation change or screen adjustments).
   * @since Mini Apps v8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#content_safe_area_changed
   * */
  content_safe_area_changed: SafeAreaInsets;
  /**
   * Custom method invocation completed.
   * @since v6.9
   * @see https://docs.telegram-mini-apps.com/platform/events#custom-method-invoked
   */
  custom_method_invoked: WithReqId<{
    /**
     * Method invocation successful result.
     */
    result?: unknown;
    /**
     * Method invocation error code.
     */
    error?: string;
  }>;
  /**
   * Device orientation data changed.
   * @since 8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#device-orientation-changed
   */
  device_orientation_changed: {
    /**
     * A boolean that indicates whether the device is providing orientation data in
     * absolute values.
     */
    absolute?: Maybe<boolean>;
    /**
     * The rotation around the Z-axis, measured in radians.
     */
    alpha: number;
    /**
     * The rotation around the X-axis, measured in radians.
     */
    beta: number;
    /**
     * The rotation around the Y-axis, measured in radians.
     */
    gamma: number;
  };
  /**
   * Device orientation data tracking failed to start.
   * @since 8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#device-orientation-failed
   */
  device_orientation_failed: {
    /**
     * Occurred error.
     */
    error: string;
  };
  /**
   * Device orientation data tracking started.
   * @since 8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#device-orientation-started
   */
  device_orientation_started: never;
  /**
   * Device orientation data tracking stopped.
   * @since 8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#device-orientation-stopped
   */
  device_orientation_stopped: never;
  /**
   * Device's local storage was cleared.
   * @since v9.0
   * @see https://docs.telegram-mini-apps.com/platform/events#device-storage-cleared
   */
  device_storage_cleared: WithReqId;
  /**
   * An error occurred while working with the device's local storage.
   * @since v9.0
   * @see https://docs.telegram-mini-apps.com/platform/events#device-storage-failed
   */
  device_storage_failed: WithReqId<{
    /**
     * An occurred error.
     */
    error?: string;
  }>;
  /**
   * A value from the device's local storage was retrieved.
   * @since v9.0
   * @see https://docs.telegram-mini-apps.com/platform/events#device-storage-key-received
   */
  device_storage_key_received: WithReqId<{
    /**
     * A retrieved value.
     */
    value: string | null;
  }>;
  /**
   * A value in the device's local storage was saved.
   * @since v9.0
   * @see https://docs.telegram-mini-apps.com/platform/events#device-storage-key-saved
   */
  device_storage_key_saved: WithReqId;
  /**
   * Request to set custom emoji status was requested.
   * @see https://docs.telegram-mini-apps.com/platform/events#emoji-status-access-requested
   * @since v8.0
   */
  emoji_status_access_requested: {
    /**
     * Request status.
     */
    status: EmojiStatusAccessRequestedStatus;
  };
  /**
   * Failed to set custom emoji status.
   * @see https://docs.telegram-mini-apps.com/platform/events#emoji-status-failed
   * @since v8.0
   */
  emoji_status_failed: {
    error: EmojiStatusFailedError;
  };
  /**
   * Custom emoji status set.
   * @see https://docs.telegram-mini-apps.com/platform/events#emoji-status-set
   * @since v8.0
   */
  emoji_status_set: never;
  /**
   * Application received file download request status.
   * @since 8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#file-download-requested
   */
  file_download_requested: {
    status?: Maybe<'downloading' | string>;
  };
  /**
   * App entered or exited fullscreen mode.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#fullscreen-changed
   */
  fullscreen_changed: {
    /**
     * Is application currently in the fullscreen mode.
     */
    is_fullscreen: boolean;
  };
  /**
   * App failed to expand to the fullscreen mode.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#fullscreen-changed
   */
  fullscreen_failed: {
    /**
     * Full Screen mode status error.
     */
    error: FullScreenErrorStatus;
  };
  /**
   * Gyroscope data changed.
   * @since 8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#gyroscope-changed
   */
  gyroscope_changed: {
    /**
     * The current rotation rate around the X-axis, measured in rad/s.
     */
    x: number;
    /**
     * The current rotation rate around the Y-axis, measured in rad/s.
     */
    y: number;
    /**
     * The current rotation rate around the Z-axis, measured in rad/s.
     */
    z: number;
  };
  /**
   * Gyroscope data tracking failed to run.
   * @since 8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#gyroscope-failed
   */
  gyroscope_failed: {
    /**
     * Occurred error.
     */
    error: string;
  };
  /**
   * Gyroscope data tracking started.
   * @since 8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#gyroscope-started
   */
  gyroscope_started: never;
  /**
   * Gyroscope data tracking stopped.
   * @since 8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#gyroscope-stopped
   */
  gyroscope_stopped: never;
  /**
   * The mini application was added to the device's home screen.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#home_screen_added
   */
  home_screen_added: never;
  /**
   * The status of the mini application being added to the home screen has been checked.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#home_screen_checked
   */
  home_screen_checked: {
    /**
     * The status of the mini application being added to the home screen.
     *
     * Possible values:
     * - `unsupported` – the feature is not supported, and it is not possible to add the icon to
     * the home screen,
     * - `unknown` – the feature is supported, and the icon can be added, but it is not possible to
     *   determine if the icon has already been added,
     * - `added` – the icon has already been added to the home screen,
     * - `missed` – the icon has not been added to the home screen.
     */
    status?: HomeScreenStatus;
  };
  /**
   * User declined the request to add the current mini application to the device's home screen.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#home_screen_failed
   */
  home_screen_failed: never;
  /**
   * An invoice was closed.
   * @see https://docs.telegram-mini-apps.com/platform/events#invoice-closed
   */
  invoice_closed: {
    /**
     * Passed during the `web_app_open_invoice` method invocation `slug` value.
     */
    slug: string;
    /**
     * Invoice status.
     */
    status: InvoiceStatus;
  };
  /**
   * Checks the location-related functionality availability state.
   * @since 8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#location-checked
   */
  location_checked:
    | { available: false }
    | {
      available: true;
      access_requested?: Maybe<boolean>;
      access_granted?: Maybe<boolean>;
    };
  /**
   * Location-related functionality availability status was retrieved.
   * @since 8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#location-requested
   */
  location_requested:
    | { available: false }
    | {
      available: true;
      /**
     * Latitude in degrees.
     */
      latitude: number;
      /**
     * Longitude in degrees.
     */
      longitude: number;
      /**
     * Altitude above sea level in meters.
     */
      altitude?: Maybe<number>;
      /**
     * The direction the device is moving in degrees.
     */
      course?: Maybe<number>;
      /**
     * The speed of the device in m/s.
     */
      speed?: Maybe<number>;
      /**
     * Accuracy of the latitude and longitude values in meters.
     */
      horizontal_accuracy?: Maybe<number>;
      /**
     * Accuracy of the altitude value in meters.
     */
      vertical_accuracy?: Maybe<number>;
      /**
     * Accuracy of the course value in degrees.
     */
      course_accuracy?: Maybe<number>;
      /**
     * Accuracy of the speed value in m/s.
     */
      speed_accuracy?: Maybe<number>;
    };
  /**
   * A user clicked the Main Button.
   * @see https://docs.telegram-mini-apps.com/platform/events#main-button-pressed
   */
  main_button_pressed: never;
  /**
   * Application received phone access request status.
   * @since v6.9
   * @see https://docs.telegram-mini-apps.com/platform/events#phone-requested
   */
  phone_requested: {
    /**
     * Request status.
     */
    status: PhoneRequestedStatus;
  };
  /**
   * Popup was closed.
   * @see https://docs.telegram-mini-apps.com/platform/events#popup-closed
   */
  popup_closed: {
    /**
     * Identifier of the clicked button. In case, the popup was closed without
     * clicking any button, this property will be omitted.
     */
    button_id?: string;
  };
  /**
   * Failed to send a prepared message.
   * @since 8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#prepared-message-failed
   */
  prepared_message_failed: {
    /**
     * Occurred error.
     */
    error: 'USER_DECLINED' | string;
  };
  /**
   * A prepared message was sent.
   * @since 8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#prepared-message-sent
   */
  prepared_message_sent: never;
  /**
   * The QR scanner scanned some QR and extracted its content.
   * @param payload - event payload.
   * @since v6.4
   * @see https://docs.telegram-mini-apps.com/platform/events#qr-text-received
   */
  qr_text_received: {
    /**
     * Data extracted from the QR.
     */
    data: string;
  };
  /**
   * Parent iframe requested current iframe reload.
   * @see https://docs.telegram-mini-apps.com/platform/events#reload-iframe
   */
  reload_iframe: never;
  /**
   * Failed to share a chat requested via the `web_app_request_chat` method.
   * @since v9.6
   * @see https://docs.telegram-mini-apps.com/platform/events#requested-chat-failed
   */
  requested_chat_failed: {
    /**
     * Occurred error.
     */
    error: string;
  };
  /**
   * A chat requested via the `web_app_request_chat` method was shared.
   * @since v9.6
   * @see https://docs.telegram-mini-apps.com/platform/events#requested-chat-sent
   */
  requested_chat_sent: never;
  /**
   * Occurs whenever the device's safe area insets change
   * (e.g., due to orientation change or screen adjustments).
   * @since Mini Apps v8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#safe_area_changed
   * */
  safe_area_changed: SafeAreaInsets;
  /**
   * QR scanner was closed.
   * @since v6.4
   * @see https://docs.telegram-mini-apps.com/platform/events#scan-qr-popup-closed
   */
  scan_qr_popup_closed: never;
  /**
   * User clicked the secondary button.
   * @since v7.10
   * @see https://docs.telegram-mini-apps.com/platform/events#secondary-button-pressed
   */
  secondary_button_pressed: never;
  /**
   * Device's secure storage was cleared.
   * @since v9.0
   * @see https://docs.telegram-mini-apps.com/platform/events#secure-storage-cleared
   */
  secure_storage_cleared: WithReqId;
  /**
   * An error occurred while working with the device's secure storage.
   * @since v9.0
   * @see https://docs.telegram-mini-apps.com/platform/events#secure-storage-failed
   */
  secure_storage_failed: WithReqId<{
    /**
     * An occurred error.
     */
    error?: string;
  }>;
  /**
   * A value from the device's secure storage was retrieved.
   * @since v9.0
   * @see https://docs.telegram-mini-apps.com/platform/events#secure-storage-key-received
   */
  secure_storage_key_received: WithReqId<{
    /**
     * A retrieved value.
     */
    value: string | null;
    /**
     * True if this value can be restored.
     */
    can_restore?: boolean;
  }>;
  /**
   * A value from the device's secure storage was restored.
   * @since v9.0
   * @see https://docs.telegram-mini-apps.com/platform/events#secure-storage-key-restored
   */
  secure_storage_key_restored: WithReqId<{
    /**
     * A restored value.
     */
    value: string | null;
  }>;
  /**
   * A value in the device's secure storage was saved.
   * @since v9.0
   * @see https://docs.telegram-mini-apps.com/platform/events#secure-storage-key-saved
   */
  secure_storage_key_saved: WithReqId;
  /**
   * The event which is usually sent by the Telegram web application. Its
   * payload represents
   * `<style/>` tag html content, a developer could use. The stylesheet
   * described in the payload will help the developer to stylize the app
   * scrollbar (but he is still able to do it himself).
   * @see https://docs.telegram-mini-apps.com/platform/events#set-custom-style
   */
  set_custom_style: string;
  /**
   * Occurs when the Settings Button was pressed.
   * @since v6.1
   * @see https://docs.telegram-mini-apps.com/platform/events#settings-button-pressed
   */
  settings_button_pressed: never;
  /**
   * Occurs whenever theme settings are changed in the user's Telegram app
   * (including switching to night mode).
   * @see https://docs.telegram-mini-apps.com/platform/events#theme-changed
   */
  theme_changed: {
    /**
     * Map where the key is a theme stylesheet key and value is the
     * corresponding color in
     * `#RRGGBB` format.
     */
    theme_params: {
      /**
       * @since v6.10
       */
      accent_text_color?: RGB;
      /**
       * @since 7.10
       */
      bottom_bar_bg_color?: RGB;
      bg_color?: RGB;
      button_color?: RGB;
      button_text_color?: RGB;
      /**
       * @since v6.10
       */
      destructive_text_color?: RGB;
      /**
       * @since v6.10
       */
      header_bg_color?: RGB;
      hint_color?: RGB;
      link_color?: RGB;
      secondary_bg_color?: RGB;
      /**
       * @since v6.10
       */
      section_bg_color?: RGB;
      /**
       * @since v6.10
       */
      section_header_text_color?: RGB;
      /**
       * @since v6.10
       */
      subtitle_text_color?: RGB;
      text_color?: RGB;
      // Future unknown palette keys.
      [key: string]: RGB | undefined;
    };
  };
  /**
   * Occurs whenever the viewport has been changed. For example, when the user
   * started dragging the application or called the expansion method.
   * @see https://docs.telegram-mini-apps.com/platform/events#viewport-changed
   */
  viewport_changed: {
    /**
     * The viewport height.
     */
    height: number;
    /**
     * The viewport width.
     */
    width: number;
    /**
     * Is the viewport currently expanded.
     */
    is_expanded: boolean;
    /**
     * Is the viewport current state stable and not going to change in the next
     * moment.
     */
    is_state_stable: boolean;
  };
  /**
   * Occurs whenever the mini app becomes active or inactive.
   *
   * Active state assumes that the native Telegram client is currently working with the
   * current mini application. It is important to note that this is not related to the
   * mini application’s visibility, but rather its selection among other currently opened
   * mini applications.
   * @since v8.0
   * @see https://docs.telegram-mini-apps.com/platform/events#visibility_changed
   */
  visibility_changed: {
    /**
     * Indicates if the application is currently active.
     */
    is_visible: boolean;
  };
  /**
   * Application received write access request status.
   * @since v6.9
   * @see https://docs.telegram-mini-apps.com/platform/events#write-access-requested
   */
  write_access_requested: {
    /**
     * Request status.
     */
    status: WriteAccessRequestedStatus;
  };
}

/**
 * Mini Apps event name.
 */
export type EventName = keyof Events;

/**
 * Payload of the specified Mini Apps event.
 */
export type EventPayload<E extends EventName> = Events[E];

export type EventWithoutPayload = {
  [E in EventName]: If<IsNever<EventPayload<E>>, E, never>
}[EventName];

export type EventWithPayload = {
  [E in EventName]: undefined extends EventPayload<E> ? never : E
}[EventName];
