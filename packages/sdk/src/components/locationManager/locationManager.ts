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
   * True if the permission to use location was granted.
   */
  accessGranted: boolean;
  /**
   * True if the permission to use location was requested.
   */
  accessRequested: boolean;
  /**
   * True if location data is available on the current device.
   */
  available: boolean;
}

/**
 * @see https://core.telegram.org/bots/webapps#locationdata
 */
export interface LocationData {
  /**
   * Altitude above sea level in meters.
   */
  altitude?: number | null;
  /**
   * Direction the device is moving in degrees, 0 is north.
   */
  course?: number | null;
  /**
   * Accuracy of the course in degrees.
   */
  course_accuracy?: number | null;
  /**
   * Accuracy of the latitude and longitude in meters.
   */
  horizontal_accuracy?: number | null;
  latitude: number;
  longitude: number;
  /**
   * Speed in meters per second.
   */
  speed?: number | null;
  /**
   * Accuracy of the speed in meters per second.
   */
  speed_accuracy?: number | null;
  /**
   * Accuracy of the altitude in meters.
   */
  vertical_accuracy?: number | null;
}

/**
 * All methods throw:
 * - `NotInitializedError` if the SDK is not initialized;
 * - `MethodUnsupportedError` if the location manager is unsupported.
 * @since Mini Apps v8.0
 */
export interface LocationManager extends StatefulComponent<LocationManagerState>,
  MountableComponent {
  isAccessGranted: Computed<boolean>;
  isAccessRequested: Computed<boolean>;
  isAvailable: Computed<boolean>;
  /**
   * True if the component is mounting.
   */
  isMounting: Computed<boolean>;
  /**
   * @returns True if the SDK is initialized and the location manager is supported.
   */
  isSupported: () => boolean;
  /**
   * Throwing version of `safeMount`.
   * @throws {TimeoutError} The Telegram client didn't respond in time.
   */
  mount: (options?: AsyncOptions) => Promise<void>;
  /**
   * Opens the location settings. Use it when the user denied the access, but the mini app needs
   * it. Call it only in response to the user interaction.
   */
  openSettings: () => void;
  /**
   * Throwing version of `safeRequestLocation`.
   * @throws {NotMountedError} The component is not mounted.
   * @throws {TimeoutError} The Telegram client didn't respond in time.
   */
  requestLocation: (options?: AsyncOptions) => Promise<LocationData | null>;
  /**
   * Mounts the component. If the page was reloaded, the state saved before the reload is
   * restored. Otherwise, it is requested from the Telegram client. Each call
   * retrieves the state independently.
   * @param options - additional options.
   * @returns `TimeoutError` if the Telegram client didn't respond in time.
   */
  safeMount: (options?: AsyncOptions) => Promise<Result<TimeoutError, void>>;
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
}

function toState(payload: EventPayload<'location_checked'>): LocationManagerState {
  return payload.available
    ? {
      accessGranted: !!payload.access_granted,
      accessRequested: !!payload.access_requested,
      available: true,
    }
    : { accessGranted: false, accessRequested: false, available: false };
}

const METHOD = 'web_app_check_location';

/**
 * @internal
 */
export function createLocationManager(): LocationManager {
  const core = createComponentCore<LocationManagerState>('locationManager', {
    accessGranted: false,
    accessRequested: false,
    available: false,
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
    isAccessGranted: computedPick(state, 'accessGranted'),
    isAccessRequested: computedPick(state, 'accessRequested'),
    isAvailable: computedPick(state, 'available'),
    isMounted: computedFromStore(core.mounted),
    isMounting: computedFromStore(asyncMount.mounting),
    isSupported: () => isMethodSupported(METHOD),
    mount: throwing(safeMount),
    openSettings() {
      requireMethod('web_app_open_location_settings').postEvent('web_app_open_location_settings');
    },
    requestLocation: throwing(safeRequestLocation),
    safeMount,
    safeRequestLocation,
    state: computedFromStore(state),
    unmount() {
      asyncMount.cancel();
      if (core.unmount()) {
        stopListening && stopListening();
      }
    },
  };
}

/**
 * Device location.
 * @since Mini Apps v8.0
 */
export const locationManager = /* @__PURE__ */ createLocationManager();
