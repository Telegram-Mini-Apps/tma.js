import {
  type AndroidDeviceData,
  retrieveAndroidDeviceData,
  retrieveAndroidDeviceDataFrom,
} from '@tma.js/sdk';
import { useMemo } from 'react';

/**
 * @returns Android device data from `navigator.userAgent`.
 * @see https://core.telegram.org/bots/webapps#additional-data-in-user-agent
 */
export function useAndroidDeviceData(): AndroidDeviceData {
  return useMemo(retrieveAndroidDeviceData, []);
}

/**
 * @returns Android device data from the user agent.
 * @param userAgent - user agent.
 * @see https://core.telegram.org/bots/webapps#additional-data-in-user-agent
 */
export function useAndroidDeviceDataFrom(userAgent: string): AndroidDeviceData {
  return useMemo(() => retrieveAndroidDeviceDataFrom(userAgent), [userAgent]);
}
