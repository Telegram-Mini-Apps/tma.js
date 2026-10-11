/**
 * Device data added by Telegram for Android to the user agent.
 * @see https://core.telegram.org/bots/webapps#additional-data-in-user-agent
 */
export interface AndroidDeviceData {
  appVersion?: string;
  manufacturer?: string;
  model?: string;
  androidVersion?: string;
  sdkVersion?: number;
  performanceClass?: 'LOW' | 'AVERAGE' | 'HIGH' | string;
}

/**
 * Retrieves Android device data from the user agent.
 * @param userAgent - user agent.
 * @see https://core.telegram.org/bots/webapps#additional-data-in-user-agent
 * @example
 * retrieveAndroidDeviceDataFrom(
 *   'Telegram-Android/11.11.0 (Samsung SM-A155F; Android 14; SDK 34; AVERAGE)',
 * );
 */
export function retrieveAndroidDeviceDataFrom(userAgent: string): AndroidDeviceData {
  const result: AndroidDeviceData = {};
  const match = userAgent.match(/Telegram-Android(?:\/([^ ]+))?(?: (\([^)]+\))?|$)/);
  if (!match) {
    return result;
  }
  const [, appVersion, systemInfo] = match;
  appVersion && (result.appVersion = appVersion);
  systemInfo && systemInfo
    .slice(1, -1)
    .split(';')
    .forEach(item => {
      const [key, value] = item.trim().split(' ');
      if (key === 'Android') {
        result.androidVersion = value;
      } else if (key === 'SDK') {
        const parsed = parseInt(value, 10);
        parsed && (result.sdkVersion = parsed);
      } else if (value) {
        result.manufacturer = key;
        result.model = value;
      } else {
        result.performanceClass = key;
      }
    });
  return result;
}

/**
 * Retrieves Android device data from `navigator.userAgent`.
 * @see https://core.telegram.org/bots/webapps#additional-data-in-user-agent
 */
export function retrieveAndroidDeviceData(): AndroidDeviceData {
  return retrieveAndroidDeviceDataFrom(navigator.userAgent);
}
