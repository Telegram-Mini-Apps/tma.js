import {
  type AndroidDeviceData,
  retrieveAndroidDeviceDataFrom,
} from './retrieveAndroidDeviceDataFrom.js';

/**
 * Retrieves Android device data from the navigator.userAgent.
 * @see https://core.telegram.org/bots/webapps#additional-data-in-user-agent
 */
export function retrieveAndroidDeviceData(): AndroidDeviceData {
  return retrieveAndroidDeviceDataFrom(navigator.userAgent);
}
