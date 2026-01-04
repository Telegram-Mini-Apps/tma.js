import type { EventPayload, RequestError, PostEventError } from '@tma.js/bridge';
import type { Computed } from '@tma.js/signals';
import type { Maybe } from '@tma.js/toolkit';
import { BetterPromise } from 'better-promises';
import { either as E, taskEither as TE, function as fn } from 'fp-ts';

import { AsyncMountable } from '@/composables/AsyncMountable.js';
import { Stateful } from '@/composables/Stateful.js';
import type {
  LocationManagerOptions,
  LocationManagerRequestLocationResponse,
  LocationManagerState,
} from '@/features/LocationManager/types.js';
import { createIsSupportedSignal } from '@/helpers/createIsSupportedSignal.js';
import type { AsyncOptions } from '@/types.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import { createWithChecksFp, type WithChecks, type WithChecksFp } from '@/with-checks/withChecksFp.js';

function eventToState(event: EventPayload<'location_checked'>): LocationManagerState {
  let available = false;
  let accessRequested: Maybe<boolean>;
  let accessGranted: Maybe<boolean>;
  if (event.available) {
    available = true;
    accessRequested = event.access_requested;
    accessGranted = event.access_granted;
  }
  return {
    available,
    accessGranted: accessGranted || false,
    accessRequested: accessRequested || false,
  };
}

/**
 * @since Mini Apps v8.0
 */
export class LocationManager {
  constructor({
    version,
    request,
    postEvent,
    storage,
    isTma,
    isPageReload,
  }: LocationManagerOptions) {
    const stateful = new Stateful({
      initialState: {
        available: false,
        accessGranted: false,
        accessRequested: false,
      },
      onChange: storage.set,
    });
    const mountable = new AsyncMountable<LocationManagerState, RequestError>({
      isPageReload,
      restoreState: storage.get,
      onMounted: stateful.setState,
      initialState(options) {
        return fn.pipe(
          request('web_app_check_location', 'location_checked', options),
          TE.map(eventToState),
        );
      },
    });

    const wrapOptions = { version, requires: 'web_app_check_location', isTma } as const;
    const wrapSupportedEither = createWithChecksFp({
      ...wrapOptions,
      returns: 'either',
    });
    const wrapSupportedTask = createWithChecksFp({
      ...wrapOptions,
      returns: 'task',
    });
    const wrapMountedTask = createWithChecksFp({
      ...wrapOptions,
      returns: 'task',
      isMounted: mountable.isMounted,
    });

    this.isAvailable = stateful.getter('available');
    this.isAccessRequested = stateful.getter('accessRequested');
    this.isAccessGranted = stateful.getter('accessGranted');
    this.isSupported = createIsSupportedSignal('web_app_check_location', version);
    this.isMounted = mountable.isMounted;
    this.state = stateful.state;

    this.unmount = mountable.unmount;
    this.mountFp = wrapSupportedTask(mountable.mount);
    this.openSettingsFp = wrapSupportedEither(() => {
      return postEvent('web_app_open_location_settings');
    });
    this.requestLocationFp = wrapMountedTask(options => {
      return fn.pipe(
        request('web_app_request_location', 'location_requested', options),
        TE.map(response => {
          if (!response.available) {
            stateful.setState({ available: false });
            return null;
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { available, ...rest } = response;
          return rest;
        }),
      );
    });

    this.mount = throwifyWithChecksFp(this.mountFp);
    this.openSettings = throwifyWithChecksFp(this.openSettingsFp);
    this.requestLocation = throwifyWithChecksFp(this.requestLocationFp);
  }

  /**
   * Complete location manager state.
   */
  readonly state: Computed<LocationManagerState>;

  /**
   * Signal indicating whether the location data tracking is currently available.
   */
  readonly isAvailable: Computed<boolean>;

  /**
   * Signal indicating whether the user has granted the app permission to track location data.
   */
  readonly isAccessGranted: Computed<boolean>;

  /**
   * Signal indicating whether the app has previously requested permission to track location data.
   */
  readonly isAccessRequested: Computed<boolean>;

  /**
   * Signal indicating if the component is currently mounted.
   */
  readonly isMounted: Computed<boolean>;

  /**
   * Signal indicating if the component is supported.
   */
  readonly isSupported: Computed<boolean>;

  /**
   * Opens the location access settings for bots. Useful when you need to request location access
   * from users who haven't granted it yet.
   *
   * Note that this method can be called only in response to user interaction with the Mini App
   * interface (e.g., a click inside the Mini App or on the main button).
   * @since Mini Apps v8.0
   */
  readonly openSettingsFp: WithChecksFp<() => E.Either<PostEventError, void>, true>;

  /**
   * @see openSettingsFp
   */
  readonly openSettings: WithChecks<() => void, true>;

  /**
   * Requests location data.
   * @since Mini Apps v8.0
   * @returns Promise with location data or null it access was not granted.
   */
  readonly requestLocationFp: WithChecksFp<
    (options?: AsyncOptions) => (
      TE.TaskEither<RequestError, LocationManagerRequestLocationResponse | null>
    ),
    true
  >;

  /**
   * @see requestLocationFp
   */
  readonly requestLocation: WithChecks<
    (options?: AsyncOptions) => BetterPromise<LocationManagerRequestLocationResponse | null>,
    true
  >;

  /**
   * Mounts the component restoring its state.
   * @since Mini Apps v8.0
   */
  readonly mountFp: WithChecksFp<
    (options?: AsyncOptions) => TE.TaskEither<RequestError, void>,
    true
  >;

  /**
   * @see mountFp
   */
  readonly mount: WithChecks<(options?: AsyncOptions) => BetterPromise<void>, true>;

  /**
   * Unmounts the component.
   */
  readonly unmount: () => void;
}
