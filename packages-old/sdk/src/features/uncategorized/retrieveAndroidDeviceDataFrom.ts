export interface AndroidDeviceData {
  appVersion?: string;
  manufacturer?: string;
  model?: string;
  androidVersion?: string;
  sdkVersion?: number;
  performanceClass?: 'LOW' | 'AVERAGE' | 'HIGH' | string;
}

/**
 * Retrieves Android device data from the specified User Agent.
 * @see https://core.telegram.org/bots/webapps#additional-data-in-user-agent
 * @param userAgent - user agent.
 */
export function retrieveAndroidDeviceDataFrom(userAgent: string): AndroidDeviceData {
  const result: AndroidDeviceData = {};
  const match = userAgent.match(/Telegram-Android(?:\/([^ ]+))?(?: (\([^)]+\))?|$)/);
  if (match) {
    const [, appVersion, systemInfo] = match;
    appVersion && (result.appVersion = appVersion);
    systemInfo && systemInfo
      .slice(1, systemInfo.length - 1)
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
  }
  return result;
}
