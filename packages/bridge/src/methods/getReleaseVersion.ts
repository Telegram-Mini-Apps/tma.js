import { Version } from '@tma.js/types';

import {
  MethodName,
  MethodNameWithVersionedParams,
  MethodVersionedParams,
} from '@/methods/types/index.js';

const releases = {
  '6.0': [
    'iframe_ready',
    'iframe_will_reload',
    'web_app_close',
    'web_app_data_send',
    'web_app_expand',
    'web_app_open_link',
    'web_app_ready',
    'web_app_request_theme',
    'web_app_request_viewport',
    'web_app_setup_main_button',
    'web_app_setup_closing_behavior',
  ],
  6.1: [
    'web_app_open_tg_link',
    'web_app_open_invoice',
    'web_app_setup_back_button',
    'web_app_set_background_color',
    'web_app_set_header_color',
    'web_app_trigger_haptic_feedback',
  ],
  6.2: ['web_app_open_popup'],
  6.4: [
    'web_app_close_scan_qr_popup',
    'web_app_open_scan_qr_popup',
    'web_app_read_text_from_clipboard',
    { method: 'web_app_open_link', param: 'try_instant_view' },
  ],
  6.7: ['web_app_switch_inline_query'],
  6.9: [
    'web_app_invoke_custom_method',
    'web_app_request_write_access',
    'web_app_request_phone',
    { method: 'web_app_set_header_color', param: 'color' },
  ],
  '6.10': ['web_app_setup_settings_button'],
  7.2: [
    'web_app_biometry_get_info',
    'web_app_biometry_open_settings',
    'web_app_biometry_request_access',
    'web_app_biometry_request_auth',
    'web_app_biometry_update_token',
  ],
  7.6: [
    { method: 'web_app_open_link', param: 'try_browser' },
    { method: 'web_app_close', param: 'return_back' },
  ],
  7.7: ['web_app_setup_swipe_behavior'],
  7.8: ['web_app_share_to_story'],
  '7.10': [
    'web_app_setup_secondary_button',
    'web_app_set_bottom_bar_color',
    { method: 'web_app_setup_main_button', param: 'has_shine_effect' },
  ],
  '8.0': [
    'web_app_request_safe_area',
    'web_app_request_content_safe_area',
    'web_app_request_fullscreen',
    'web_app_exit_fullscreen',
    'web_app_set_emoji_status',
    'web_app_add_to_home_screen',
    'web_app_check_home_screen',
    'web_app_request_emoji_status_access',
    'web_app_check_location',
    'web_app_open_location_settings',
    'web_app_request_file_download',
    'web_app_request_location',
    'web_app_send_prepared_message',
    'web_app_start_accelerometer',
    'web_app_start_device_orientation',
    'web_app_start_gyroscope',
    'web_app_stop_accelerometer',
    'web_app_stop_device_orientation',
    'web_app_stop_gyroscope',
    'web_app_toggle_orientation_lock',
  ],
  '9.0': [
    'web_app_device_storage_clear',
    'web_app_device_storage_get_key',
    'web_app_device_storage_save_key',
    'web_app_secure_storage_clear',
    'web_app_secure_storage_get_key',
    'web_app_secure_storage_restore_key',
    'web_app_secure_storage_save_key',
  ],
  9.1: ['web_app_hide_keyboard'],
  9.5: [
    { method: 'web_app_setup_main_button', param: 'icon_custom_emoji_id' },
    { method: 'web_app_setup_secondary_button', param: 'icon_custom_emoji_id' },
  ],
};

/**
 * @returns Version of the specified method parameter release. Returns `null`
 * if passed method or parameter are unknown.
 * @param method - method name
 * @param param - method parameter
 */
export function getReleaseVersion<M extends MethodNameWithVersionedParams>(
  method: M,
  param: MethodVersionedParams<M>,
): Version | null;

/**
 * @returns Version of the specified method release. Returns `null`
 * if passed method is unknown.
 * @param method - method name.
 */
export function getReleaseVersion(method: MethodName): Version | null;
export function getReleaseVersion(method: MethodName, param?: string): Version | null {
  const versions = Object.keys(releases) as (`${keyof typeof releases}`)[];
  return versions.find(version => {
    return releases[version].some(item => {
      if (param) {
        return typeof item === 'object'
          && item.method === method
          && item.param === param;
      }
      return item === method;
    });
  }) || null;
}
