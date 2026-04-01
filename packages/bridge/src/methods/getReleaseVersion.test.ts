import type { Version } from '@tma.js/types';
import { describe, expect, it } from 'vitest';

import { getReleaseVersion } from './getReleaseVersion.js';
import type {
  MethodName,
  MethodNameWithVersionedParams,
  MethodVersionedParams,
} from './types/index.js';

type HaveCheckSupportMethodObj = {
  [M in MethodNameWithVersionedParams]: {
    title: string;
    method: M;
    param: MethodVersionedParams<M>;
  }
}[MethodNameWithVersionedParams];

describe.each<[
  version: Version,
  methods: (MethodName | HaveCheckSupportMethodObj)[],
]>([
  ['6.0', [
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
  ]],
  ['6.1', [
    'web_app_open_tg_link',
    'web_app_open_invoice',
    'web_app_setup_back_button',
    'web_app_set_background_color',
    'web_app_set_header_color',
    'web_app_trigger_haptic_feedback',
  ]],
  ['6.2', ['web_app_open_popup']],
  ['6.4', [
    'web_app_read_text_from_clipboard',
    'web_app_close_scan_qr_popup',
    'web_app_close_scan_qr_popup',
    {
      title: 'web_app_open_link.try_instant_view',
      method: 'web_app_open_link',
      param: 'try_instant_view',
    },
  ]],
  ['6.7', ['web_app_switch_inline_query']],
  ['6.9', [
    'web_app_invoke_custom_method',
    'web_app_request_write_access',
    'web_app_request_phone',
    {
      title: 'web_app_set_header_color.color',
      method: 'web_app_set_header_color',
      param: 'color',
    },
  ]],
  ['6.10', ['web_app_setup_settings_button']],
  ['7.2', [
    'web_app_biometry_get_info',
    'web_app_biometry_open_settings',
    'web_app_biometry_request_access',
    'web_app_biometry_request_auth',
    'web_app_biometry_update_token',
  ]],
  ['7.6', [
    {
      title: 'web_app_open_link.try_browser',
      method: 'web_app_open_link',
      param: 'try_browser',
    },
    {
      title: 'web_app_close.return_back',
      method: 'web_app_close',
      param: 'return_back',
    },
  ]],
  ['7.7', ['web_app_setup_swipe_behavior']],
  ['7.8', ['web_app_share_to_story']],
  ['7.10', [
    'web_app_setup_secondary_button',
    'web_app_set_bottom_bar_color',
    {
      title: 'web_app_setup_main_button.has_shine_effect',
      method: 'web_app_setup_main_button',
      param: 'has_shine_effect',
    },
  ]],
  ['8.0', [
    'web_app_request_fullscreen',
    'web_app_exit_fullscreen',
    'web_app_set_emoji_status',
    'web_app_request_emoji_status_access',
    'web_app_add_to_home_screen',
    'web_app_check_home_screen',
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
  ]],
  ['9.0', [
    'web_app_device_storage_clear',
    'web_app_device_storage_get_key',
    'web_app_device_storage_save_key',
    'web_app_secure_storage_clear',
    'web_app_secure_storage_get_key',
    'web_app_secure_storage_restore_key',
    'web_app_secure_storage_save_key',
  ]],
  ['9.1', ['web_app_hide_keyboard']],
  ['9.5', [
    {
      title: 'web_app_setup_main_button.icon_custom_emoji_id',
      method: 'web_app_setup_main_button',
      param: 'icon_custom_emoji_id',
    },
    {
      title: 'web_app_setup_secondary_button.icon_custom_emoji_id',
      method: 'web_app_setup_secondary_button',
      param: 'icon_custom_emoji_id',
    },
  ]],
])('%s', (version, methods) => {
  const methodsOnly = methods.filter((m): m is MethodName => {
    return typeof m === 'string';
  });

  const paramsOnly = methods.filter((m): m is HaveCheckSupportMethodObj => {
    return typeof m === 'object';
  });

  describe.each(methodsOnly)('%s', method => {
    it(`should return ${version}`, () => {
      expect(getReleaseVersion(method)).toBe(version);
    });
  });

  describe.each(paramsOnly)('$title', ({ method, param }) => {
    it(`should return ${version}`, () => {
      expect(getReleaseVersion(method, param)).toBe(version);
    });
  });
});
