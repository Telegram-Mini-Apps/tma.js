import { MethodParameterUnsupportedError, MethodUnsupportedError } from './errors.js';
import { getLogger } from './logger.js';
import { postEvent, type PostEventFn } from './postEvent.js';
import type { MethodName, Version } from './types/index.js';

/**
 * Mini Apps version to the methods and method parameters released in it.
 */
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
    ['web_app_open_link', 'try_instant_view'],
  ],
  6.7: ['web_app_switch_inline_query'],
  6.9: [
    'web_app_invoke_custom_method',
    'web_app_request_write_access',
    'web_app_request_phone',
    ['web_app_set_header_color', 'color'],
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
    ['web_app_open_link', 'try_browser'],
    ['web_app_close', 'return_back'],
  ],
  7.7: ['web_app_setup_swipe_behavior'],
  7.8: ['web_app_share_to_story'],
  '7.10': [
    'web_app_setup_secondary_button',
    'web_app_set_bottom_bar_color',
    ['web_app_setup_main_button', 'has_shine_effect'],
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
    ['web_app_setup_main_button', 'icon_custom_emoji_id'],
    ['web_app_setup_secondary_button', 'icon_custom_emoji_id'],
  ],
  9.6: ['web_app_request_chat'],
} as const satisfies Record<Version, readonly (MethodName | readonly [MethodName, string])[]>;

type ReleaseItem = (typeof releases)[keyof typeof releases][number];

/**
 * Methods having parameters released later than the method itself.
 */
export type MethodNameWithVersionedParams = Extract<ReleaseItem, readonly unknown[]>[0];

/**
 * Method parameters released later than the method itself.
 */
export type MethodVersionedParam<M extends MethodNameWithVersionedParams> =
  Extract<ReleaseItem, readonly [M, string]>[1];

/**
 * Compares two versions.
 * @param a - first version.
 * @param b - second version.
 * @returns `1` if `a` is greater than `b`, `-1` if `a` is lower than `b`, `0` if they are equal.
 */
export function compareVersions(a: Version, b: Version): -1 | 0 | 1 {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    if (aPart !== bPart) {
      return aPart > bPart ? 1 : -1;
    }
  }
  return 0;
}

/**
 * @returns Version the method parameter was released in, or `undefined` if it is unknown.
 * @param method - method name.
 * @param param - method parameter.
 */
export function getReleaseVersion<M extends MethodNameWithVersionedParams>(
  method: M,
  param: MethodVersionedParam<M>,
): Version | undefined;
/**
 * @returns Version the method was released in, or `undefined` if it is unknown.
 * @param method - method name.
 */
export function getReleaseVersion(method: MethodName): Version | undefined;
export function getReleaseVersion(method: string, param?: string): Version | undefined {
  return Object.keys(releases).find(version => {
    return (releases[version as keyof typeof releases] as readonly ReleaseItem[]).some(item => {
      return param
        ? typeof item === 'object' && item[0] === method && item[1] === param
        : item === method;
    });
  });
}

/**
 * @returns True if the method parameter is supported in the specified version.
 * @param method - method name.
 * @param param - method parameter.
 * @param version - Mini Apps version.
 */
export function supports<M extends MethodNameWithVersionedParams>(
  method: M,
  param: MethodVersionedParam<M>,
  version: Version,
): boolean;
/**
 * @returns True if the method is supported in the specified version.
 * @param method - method name.
 * @param version - Mini Apps version.
 */
export function supports(method: MethodName, version: Version): boolean;
export function supports(method: MethodName, paramOrVersion: string, version?: Version): boolean {
  const released = version
    ? getReleaseVersion(method as MethodNameWithVersionedParams, paramOrVersion as never)
    : getReleaseVersion(method);
  return !!released && compareVersions(released, version || paramOrVersion) <= 0;
}

export type OnUnsupportedFn = (
  data:
    | { version: Version; method: MethodName }
    | { version: Version; method: MethodName; param: string },
) => void;

/**
 * Methods parameters which make older clients misbehave. Other versioned parameters are
 * ignored by older clients, so they are not checked.
 */
const checkedParams: [MethodName, string][] = [
  ['web_app_set_header_color', 'color'],
  ['web_app_setup_main_button', 'icon_custom_emoji_id'],
  ['web_app_setup_secondary_button', 'icon_custom_emoji_id'],
];

/**
 * Creates a `postEvent` function checking if the method and its parameters are supported in
 * the specified Mini Apps version.
 * @param version - Mini Apps version.
 * @param onUnsupported - what to do when something is unsupported:
 * - `strict` (default) - throw `MethodUnsupportedError` or `MethodParameterUnsupportedError`;
 * - `non-strict` - log a warning and don't call the method;
 * - a function to call instead of the method.
 */
export function createPostEvent(
  version: Version,
  onUnsupported: 'strict' | 'non-strict' | OnUnsupportedFn = 'strict',
): PostEventFn {
  const handle: OnUnsupportedFn = typeof onUnsupported === 'function'
    ? onUnsupported
    : data => {
      const error = 'param' in data
        ? new MethodParameterUnsupportedError(data.method, data.param, data.version)
        : new MethodUnsupportedError(data.method, data.version);
      if (onUnsupported === 'strict') {
        throw error;
      }
      getLogger().warn(error.message);
    };

  return (method, ...args) => {
    if (!supports(method, version)) {
      return handle({ version, method });
    }
    const [params] = args as [unknown?];
    for (const [checkedMethod, param] of checkedParams) {
      if (
        method === checkedMethod
        && params
        && typeof params === 'object'
        && param in params
        && !supports(checkedMethod as MethodNameWithVersionedParams, param as never, version)
      ) {
        return handle({ version, method, param });
      }
    }
    postEvent(method, ...args);
  };
}
