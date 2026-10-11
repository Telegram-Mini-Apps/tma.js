/**
 * Telegram application platform name.
 */
export type Platform =
  | 'android'
  | 'android_x'
  | 'ios'
  | 'macos'
  | 'tdesktop'
  | 'unigram'
  | 'unknown'
  | 'web'
  | 'weba'
  | string;

/**
 * Telegram Mini Apps version in format like "\d+.\d+".
 * @example "7.0"
 */
export type Version = string;
