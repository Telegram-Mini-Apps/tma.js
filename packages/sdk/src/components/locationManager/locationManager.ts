import {
  type EventPayload,
  ok,
  onEvent,
  type Result,
  safeRequest,
  throwing,
  type TimeoutError,
} from '@tma.js/bridge';

import { createAsyncMount, createComponentCore } from '../../component.js';
import { getGlobals, isMethodSupported, requireMethod } from '../../globals.js';
import { type Computed, computedFromStore, computedPick } from '../../store.js';
import type { AsyncOptions, MountableComponent, StatefulComponent } from '../../types.js';

export interface LocationManagerState {
  /**
   * True if location data is available on the current device.
   */
  available: boolean;
  /**
   * True if the permission to use location was requested.
   */
  accessRequested: boolean;
  /**
   * True if the permission to use location was granted.
   */
  accessGranted: boolean;
}

/**
 * @see https://core.telegram.org/bots/webapps#locationdata
 */
export interface LocationData {
  latitude: number;
  longitude: number;
  /**
   * Altitude above sea level in meters.
   */
  altitude?: number | null;
  /**
   * Direction the device is moving in degrees, 0 is north.
   */
  course?: number | null;
  /**
   * Speed in meters per second.
   */
  speed?: number | null;
  /**
   * Accuracy of the latitude and longitude in meters.
   */
  horizontal_accuracy?: number | null;
  /**
   * Accuracy of the altitude in meters.
   */
  vertical_accuracy?: number | null;
  /**
   * Accuracy of the course in degrees.
   */
  course_accuracy?: number | null;
  /**
   * Accuracy of the speed in meters per second.
   */
  speed_accuracy?: number | null;
}

/**
 * All methods throw:
 * - `NotInitializedError` if the SDK is not initialized;
 * - `MethodUnsupportedError` if the location manager is unsupported.
 * @since Mini Apps v8.0
 */
export interface LocationManager extends StatefulComponent<LocationManagerState>,
  MountableComponent {
  /**
   * @returns True if the SDK is initialized and the location manager is supported.
   */
  isSupported: () => boolean;
  isAvailable: Computed<boolean>;
  isAccessRequested: Computed<boolean>;
  isAccessGranted: Computed<boolean>;
  /**
   * True if the component is mounting.
   */
  isMounting: Computed<boolean>;
  /**
   * Mounts the component. If the page was reloaded, the state saved before the reload is
   * restored. Otherwise, it is requested from the Telegram client. Each call
   * retrieves the state independently.
   * @param options - additional options.
   * @returns `TimeoutError` if the Telegram client didn't respond in time.
   */
  safeMount: (options?: AsyncOptions) => Promise<Result<TimeoutError, void>>;
  /**
   * Throwing version of `safeMount`.
   * @throws {TimeoutError} The Telegram client didn't respond in time.
   */
  mount: (options?: AsyncOptions) => Promise<void>;
  /**
   * Requests the device location. Requires the component to be mounted.
   * @param options - additional options.
   * @returns Location data, or `null` if location is unavailable or the access was denied.
   * `TimeoutError` if the Telegram client didn't respond in time.
   * @throws {NotMountedError} The component is not mounted.
   */
  safeRequestLocation: (
    options?: AsyncOptions,
  ) => Promise<Result<TimeoutError, LocationData | null>>;
  /**
   * Throwing version of `safeRequestLocation`.
   * @throws {NotMountedError} The component is not mounted.
   * @throws {TimeoutError} The Telegram client didn't respond in time.
   */
  requestLocation: (options?: AsyncOptions) => Promise<LocationData | null>;
  /**
   * Opens the location settings. Use it when the user denied the access, but the mini app needs
   * it. Call it only in response to the user interaction.
   */
  openSettings: () => void;
}

function toState(payload: EventPayload<'location_checked'>): LocationManagerState {
  return payload.available
    ? {
      available: true,
      accessGranted: !!payload.access_granted,
      accessRequested: !!payload.access_requested,
    }
    : { available: false, accessGranted: false, accessRequested: false };
}

const METHOD = 'web_app_check_location';

/**
 * @internal
 */
export function createLocationManager(): LocationManager {
  const core = createComponentCore<LocationManagerState>('locationManager', {
    available: false,
    accessGranted: false,
    accessRequested: false,
  });
  const { state } = core;
  let stopListening: VoidFunction | undefined;

  const asyncMount = createAsyncMount(core, async options => {
    const response = await safeRequest(METHOD, 'location_checked', {
      ...options,
      postEvent: getGlobals().postEvent,
    });
    return response.ok ? ok(toState(response.data)) : response;
  }, () => {
    stopListening = onEvent('location_checked', payload => state.set(toState(payload)));
  });
  const safeMount = async (options?: AsyncOptions) => {
    requireMethod(METHOD);
    return asyncMount.safeMount(options);
  };

  const safeRequestLocation: LocationManager['safeRequestLocation'] = async options => {
    const { postEvent } = requireMethod('web_app_request_location');
    core.assertMounted();
    const response = await safeRequest('web_app_request_location', 'location_requested', {
      ...options,
      postEvent,
    });
    if (!response.ok) {
      return response;
    }
    if (!response.data.available) {
      state.update({ available: false });
      return ok(null);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { available, ...location } = response.data;
    return ok(location);
  };

  return {
    isSupported: () => isMethodSupported(METHOD),
    isAvailable: computedPick(state, 'available'),
    isAccessRequested: computedPick(state, 'accessRequested'),
    isAccessGranted: computedPick(state, 'accessGranted'),
    state: computedFromStore(state),
    isMounted: computedFromStore(core.mounted),
    isMounting: computedFromStore(asyncMount.mounting),
    safeMount,
    mount: throwing(safeMount),
    unmount() {
      asyncMount.cancel();
      if (core.unmount()) {
        stopListening && stopListening();
      }
    },
    safeRequestLocation,
    requestLocation: throwing(safeRequestLocation),
    openSettings() {
      requireMethod('web_app_open_location_settings').postEvent('web_app_open_location_settings');
    },
  };
}

/**
 * Device location.
 * @since Mini Apps v8.0
 */
export const locationManager = /* @__PURE__ */ createLocationManager();
