import type { InitData } from './init-data.js';
import type { Platform, Version } from './common.js';
import type { ThemeParams } from './theme-params.js';

/**
 * Telegram Mini Apps launch parameters.
 * @see https://docs.telegram-mini-apps.com/platform/launch-parameters
 */
export interface LaunchParams {
  /**
   * True if Mini App is currently launched in the inline mode.
   */
  tgWebAppBotInline?: boolean;
  /**
   * Current launch init data.
   */
  tgWebAppData?: InitData;
  /**
   * TODO: This property is not documented by the Telegram team.
   */
  tgWebAppDefaultColors?: ThemeParams;
  /**
   * True if the fullscreen mode is enabled.
   */
  tgWebAppFullscreen?: boolean;
  /**
   * Unique Telegram client platform identifier.
   */
  tgWebAppPlatform: Platform;
  /**
   * True if the application is required to show the Settings Button.
   */
  tgWebAppShowSettings?: boolean;
  /**
   * Start parameter passed in the application direct link.
   */
  tgWebAppStartParam?: string;
  /**
   * Mini App palette settings.
   */
  tgWebAppThemeParams: ThemeParams;
  /**
   * Currently supported Mini Apps' version.
   */
  tgWebAppVersion: Version;
}
