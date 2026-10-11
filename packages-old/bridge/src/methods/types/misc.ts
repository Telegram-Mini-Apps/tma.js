import type { RGB } from '@tma.js/types';

type KnownColorKey = 'bg_color' | 'secondary_bg_color';

/**
 * Color key which could be used to update header color.
 */
export type HeaderColorKey = KnownColorKey;

/**
 * Color key which could be used to update Mini App background color.
 */
export type BackgroundColor = RGB;

/**
 * Color key which could be used to update bottom bar background color.
 */
export type BottomBarColor = RGB;

/**
 * Position of the secondary button related to the main one.
 */
export type SecondaryButtonPosition = 'left' | 'right' | 'top' | 'bottom';

/**
 * Values expected by the `web_app_open_link.try_browser` option.
 */
export type OpenLinkBrowser =
  | 'google-chrome'
  | 'chrome'
  | 'mozilla-firefox'
  | 'firefox'
  | 'microsoft-edge'
  | 'edge'
  | 'opera'
  | 'opera-mini'
  | 'brave'
  | 'brave-browser'
  | 'duckduckgo'
  | 'duckduckgo-browser'
  | 'samsung'
  | 'samsung-browser'
  | 'vivaldi'
  | 'vivaldi-browser'
  | 'kiwi'
  | 'kiwi-browser'
  | 'uc'
  | 'uc-browser'
  | 'tor'
  | 'tor-browser';

/**
 * Chat type which could be used when calling `web_app_switch_inline_query` method.
 */
export type SwitchInlineQueryChatType = 'users' | 'bots' | 'groups' | 'channels';
