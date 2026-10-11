import type { RGB } from './colors.js';

export type KnownThemeParamsKey =
  | 'accent_text_color'
  | 'bg_color'
  | 'button_color'
  | 'button_text_color'
  | 'bottom_bar_bg_color'
  | 'destructive_text_color'
  | 'header_bg_color'
  | 'hint_color'
  | 'link_color'
  | 'secondary_bg_color'
  | 'section_bg_color'
  | 'section_header_text_color'
  | 'section_separator_color'
  | 'subtitle_text_color'
  | 'text_color';

/**
 * Application [theme parameters](https://docs.telegram-mini-apps.com/platform/theming).
 * Defines palette used by the Telegram application.
 */
export type ThemeParams = Partial<Record<KnownThemeParamsKey | string, RGB>>;
