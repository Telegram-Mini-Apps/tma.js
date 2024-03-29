import { retrieveFromLocation } from './retrieveFromLocation.js';
import { retrieveFromPerformance } from './retrieveFromPerformance.js';
import { retrieveFromStorage, saveToStorage } from './storage.js';
import type { LaunchParams } from './types.js';
import { logger } from '../globals.js';

/**
 * @returns Launch parameters from any known source.
 * @throws Error if extraction was unsuccessful.
 */
export function retrieveLaunchParams(): LaunchParams {
  const errors = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const retrieve of [
    // Try to retrieve launch parameters from the current location. This method can return
    // nothing in case, location was changed and then page was reloaded.
    retrieveFromLocation,
    // Then, try using the lower level API - window.performance.
    retrieveFromPerformance,
    // Finally, try to extract launch parameters from the session storage.
    retrieveFromStorage,
  ]) {
    try {
      const lp = retrieve();
      saveToStorage(lp);
      return lp;
    } catch (e) {
      errors.push(e);
    }
  }

  logger.error('Unable to extract launch parameters. Received errors:', errors);
  throw new Error('Unable to retrieve launch parameters from any known source.');
}
