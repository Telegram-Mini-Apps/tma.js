import type { LaunchParams } from './types.js';
import { serializeThemeParams } from '../components/theme-params/serializeThemeParams.js';

/**
 * Converts launch parameters to its initial representation.
 * @param value - launch parameters.
 */
export function serializeLaunchParams(value: LaunchParams): string {
  const {
    initDataRaw,
    themeParams,
    platform,
    version,
    showSettings,
    startParam,
    botInline,
  } = value;

  const params = new URLSearchParams();

  if (initDataRaw) {
    params.set('tgWebAppData', initDataRaw);
  }
  params.set('tgWebAppPlatform', platform);
  params.set('tgWebAppThemeParams', serializeThemeParams(themeParams));
  params.set('tgWebAppVersion', version);

  if (startParam) {
    params.set('tgWebAppStartParam', version);
  }

  if (typeof showSettings === 'boolean') {
    params.set('tgWebAppShowSettings', showSettings ? '1' : '0');
  }

  if (typeof botInline === 'boolean') {
    params.set('tgWebAppBotInline', botInline ? '1' : '0');
  }

  return params.toString();
}
