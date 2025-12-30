import type {
  RequestError,
  PostEventError,
  EventPayload,
  BiometryAuthRequestStatus,
  EventListener,
  BiometryTokenUpdateStatus,
} from '@tma.js/bridge';
import type { Computed } from '@tma.js/signals';
import { BetterPromise } from 'better-promises';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';

import { AsyncMountable } from '@/composables/AsyncMountable.js';
import { Stateful } from '@/composables/Stateful.js';
import { NotAvailableError } from '@/errors.js';
import type {
  BiometryAuthenticateOptions, BiometryOptions,
  BiometryRequestAccessOptions,
  BiometryState,
  BiometryUpdateTokenOptions,
} from '@/features/Biometry/types.js';
import { createIsSupportedSignal } from '@/helpers/createIsSupportedSignal.js';
import type { AsyncOptions } from '@/types.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import { createWithChecksFp, WithChecks, WithChecksFp } from '@/with-checks/withChecksFp.js';

type BiometryTask<T> = TE.TaskEither<RequestError, T>;

interface AuthenticateResult {
  /**
   * Authentication status.
   */
  status: BiometryAuthRequestStatus;
  /**
   * Token from the local secure storage saved previously.
   */
  token?: string;
}

function createNotAvailableError() {
  return new NotAvailableError('Biometry is not available');
}

function eventToState(event: EventPayload<'biometry_info_received'>): BiometryState {
  let available = false;
  let tokenSaved = false;
  let deviceId = '';
  let accessRequested = false;
  let type = '';
  let accessGranted = false;
  if (event.available) {
    available = true;
    tokenSaved = event.token_saved;
    deviceId = event.device_id;
    accessRequested = event.access_requested;
    type = event.type;
    accessGranted = event.access_granted;
  }
  return { available, tokenSaved, deviceId, type, accessGranted, accessRequested };
}

/**
 * @since Mini Apps v7.2
 */
export class Biometry {
  constructor({
    version,
    request,
    postEvent,
    storage,
    onInfoReceived,
    offInfoReceived,
    isTma,
    isPageReload,
  }: BiometryOptions) {
    const listener: EventListener<'biometry_info_received'> = event => {
      stateful.setState(eventToState(event));
    };

    const stateful = new Stateful<BiometryState>({
      initialState: {
        available: false,
        type: 'unknown',
        accessGranted: false,
        accessRequested: false,
        deviceId: '',
        tokenSaved: false,
      },
      onChange: storage.set,
    });
    const mountable = new AsyncMountable({
      initialState(options) {
        return pipe(
          request('web_app_biometry_get_info', 'biometry_info_received', options),
          TE.map(eventToState),
        );
      },
      isPageReload,
      onMounted(state) {
        stateful.setState(state);
        onInfoReceived(listener);
      },
      onUnmounted() {
        offInfoReceived(listener);
      },
      restoreState: storage.get,
    });

    const wrapOptions = { version, requires: 'web_app_biometry_request_auth', isTma } as const;
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
      isMounted: mountable.isMounted,
      returns: 'task',
    });

    this.isAvailable = stateful.getter('available');
    this.isMounted = mountable.isMounted;
    this.isSupported = createIsSupportedSignal('web_app_biometry_request_auth', version);
    this.state = stateful.state;
    this.unmount = mountable.unmount;
    this.mountFp = wrapSupportedTask(mountable.mount);

    this.authenticateFp = wrapMountedTask(options => {
      return !this.isAvailable()
        ? TE.left(createNotAvailableError())
        : pipe(
          request('web_app_biometry_request_auth', 'biometry_auth_requested', {
            ...options,
            params: { reason: ((options || {}).reason || '').trim() },
          }),
          TE.map(response => {
            stateful.setState({ token: response.token });
            return response;
          }),
        );
    });

    this.openSettingsFp = wrapSupportedEither(() => postEvent('web_app_biometry_open_settings'));

    this.requestAccessFp = wrapMountedTask(options => {
      return pipe(
        request('web_app_biometry_request_access', 'biometry_info_received', {
          ...options,
          params: { reason: ((options || {}).reason || '').trim() },
        }),
        TE.chain(response => {
          const state = eventToState(response);
          if (!state.available) {
            return TE.left(createNotAvailableError());
          }
          stateful.setState(state);
          return TE.right(state.accessRequested);
        }),
      );
    });

    this.updateTokenFp = wrapMountedTask((options = {}) => {
      return pipe(
        request('web_app_biometry_update_token', 'biometry_token_updated', {
          ...options,
          params: { token: options.token || '', reason: options.reason?.trim() },
        }),
        TE.map(response => response.status),
      );
    });

    this.authenticate = throwifyWithChecksFp(this.authenticateFp);
    this.openSettings = throwifyWithChecksFp(this.openSettingsFp);
    this.requestAccess = throwifyWithChecksFp(this.requestAccessFp);
    this.updateToken = throwifyWithChecksFp(this.updateTokenFp);
    this.mount = throwifyWithChecksFp(this.mountFp);
  }

  /**
   * Signal indicating if biometry is available.
   */
  readonly isAvailable: Computed<boolean>;

  /**
   * Signal indicating if the component is supported.
   */
  readonly isSupported: Computed<boolean>;

  /**
   * Signal indicating if the component is mounted.
   */
  readonly isMounted: Computed<boolean>;

  /**
   * Complete component state.
   */
  readonly state: Computed<BiometryState>;

  /**
   * Attempts to authenticate a user using biometrics and fetch a previously stored secure token.
   * @param options - method options.
   * @since Mini Apps v7.2
   * @returns Token from the local secure storage saved previously or undefined.
   * @example
   * const { status, token } = await biometry.authenticate({
   *   reason: 'Authenticate to open wallet',
   * });
   */
  readonly authenticateFp: WithChecksFp<(options?: BiometryAuthenticateOptions) => BiometryTask<{
    /**
     * Authentication status.
     */
    status: BiometryAuthRequestStatus;
    /**
     * Token from the local secure storage saved previously.
     */
    token?: string;
  }>, true>;

  /**
   * @see authenticateFp
   */
  readonly authenticate: WithChecks<
    (options?: BiometryAuthenticateOptions) => BetterPromise<AuthenticateResult>,
    true
  >;

  /**
   * Opens the biometric access settings for bots. Useful when you need to request biometrics
   * access to users who haven't granted it yet.
   *
   * _Note that this method can be called only in response to user interaction with the Mini App
   * interface (e.g. a click inside the Mini App or on the main button)_.
   * @since Mini Apps v7.2
   */
  readonly openSettingsFp: WithChecksFp<() => E.Either<PostEventError, void>, true>;

  /**
   * @see openSettingsFp
   */
  readonly openSettings: WithChecks<() => void, true>;

  /**
   * Requests permission to use biometrics.
   * @since Mini Apps v7.2
   * @returns Promise with true, if access was granted.
   * @example
   * const accessGranted = await biometry.requestAccess({
   *   reason: 'Authenticate to open wallet',
   * });
   */
  readonly requestAccessFp: WithChecksFp<
    (options?: BiometryRequestAccessOptions) => BiometryTask<boolean>,
    true
  >;

  /**
   * @see requestAccessFp
   */
  readonly requestAccess: WithChecks<
    (options?: BiometryRequestAccessOptions) => BetterPromise<boolean>,
    true
  >;

  /**
   * Updates the biometric token in a secure storage on the device.
   * @since Mini Apps v7.2
   * @returns Promise with `true`, if token was updated.
   * @example Setting a new token
   * biometry.updateToken({
   *   token: 'abcdef',
   * })
   * @example Deleting the token
   * biometry.updateToken();
   */
  readonly updateTokenFp: WithChecksFp<
    (options?: BiometryUpdateTokenOptions) => BiometryTask<BiometryTokenUpdateStatus>,
    true
  >;

  /**
   * @see updateTokenFp
   */
  readonly updateToken: WithChecks<
    (options?: BiometryUpdateTokenOptions) => BetterPromise<BiometryTokenUpdateStatus>,
    true
  >;

  /**
   * Mounts the component restoring its state.
   * @since Mini Apps v7.2
   */
  readonly mountFp: WithChecksFp<(options?: AsyncOptions) => BiometryTask<void>, true>;

  /**
   * @see mountFp
   */
  readonly mount: WithChecks<(options?: AsyncOptions) => BetterPromise<void>, true>;

  /**
   * Unmounts the component.
   */
  readonly unmount: () => void;
}
