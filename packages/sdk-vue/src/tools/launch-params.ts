import { type LaunchParams, retrieveLaunchData } from '@tma.js/sdk';

/**
 * Composable to retrieve launch parameters.
 */
export function useLaunchParams(): LaunchParams {
  return retrieveLaunchData().launchParams;
}
