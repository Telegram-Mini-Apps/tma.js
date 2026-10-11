/**
 * Color in the `#RRGGBB` format.
 */
export type RGB = `#${string}`;

/**
 * Telegram Mini Apps platform version, e.g. `6.10` or `9.1`.
 */
export type Version = string;

/**
 * Telegram application platform identifier.
 */
export type Platform =
  | 'android'
  | 'android_x'
  | 'ios'
  | 'macos'
  | 'tdesktop'
  | 'weba'
  | 'webk'
  | 'unigram'
  | 'unknown'
  | string;

/**
 * Theme parameters. Keys are snake-cased color names, values are colors in the `#RRGGBB` format.
 * @see https://docs.telegram-mini-apps.com/platform/theming
 */
export interface ThemeParams {
  /**
   * @since v6.10
   */
  accent_text_color?: RGB;
  bg_color?: RGB;
  /**
   * @since v7.10
   */
  bottom_bar_bg_color?: RGB;
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
   * @since v7.6
   */
  section_separator_color?: RGB;
  /**
   * @since v6.10
   */
  subtitle_text_color?: RGB;
  text_color?: RGB;
  /**
   * Keys unknown at the moment of the package release.
   */
  [key: string]: RGB | undefined;
}
