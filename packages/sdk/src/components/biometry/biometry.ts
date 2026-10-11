import {
  type BiometryAuthRequestStatus,
  type BiometryTokenUpdateStatus,
  type BiometryType,
  err,
  type EventPayload,
  ok,
  onEvent,
  type Result,
  safeRequest,
  throwing,
  type TimeoutError,
} from '@tma.js/bridge';

import { createAsyncMount, createComponentCore } from '../../component.js';
import { BiometryUnavailableError, ConcurrentCallError } from '../../errors.js';
import { getGlobals, isMethodSupported, requireMethod } from '../../globals.js';
import { type Computed, computedFromStore, computedPick } from '../../store.js';
import type { AsyncOptions, MountableComponent, StatefulComponent } from '../../types.js';

export interface BiometryState {
  /**
   * True if biometry is available on the current device.
   */
  available: boolean;
  /**
   * True if the permission to use biometry was requested.
   */
  accessRequested: boolean;
  /**
   * True if the permission to use biometry was granted.
   */
  accessGranted: boolean;
  /**
   * Unique device identifier. Use it to match the token to the device.
   */
  deviceId: string;
  /**
   * True if a token is saved in the device storage.
   */
  tokenSaved: boolean;
  /**
   * Biometry type: `finger`, `face` or `unknown`.
   */
  type: BiometryType;
}

export interface BiometryReasonOptions extends AsyncOptions {
  /**
   * Text displayed to the user, 0-128 characters.
   */
  reason?: string;
}

export interface BiometryUpdateTokenOptions extends BiometryReasonOptions {
  /**
   * Token to save, 0-1024 characters. Pass an empty string or omit it to remove the token.
   */
  token?: string;
}

export interface BiometryAuthenticateResult {
  status: BiometryAuthRequestStatus;
  /**
   * Token saved in the device storage. Returned only if the user was authorized.
   */
  token?: string;
}

/**
 * All methods throw:
 * - `NotInitializedError` if the SDK is not initialized;
 * - `MethodUnsupportedError` if biometry is unsupported.
 *
 * `authenticate`, `requestAccess` and `updateToken` throw `ConcurrentCallError` if another of
 * these requests is in progress.
 *
 * Methods requiring the component to be mounted throw `NotMountedError`.
 * @since Mini Apps v7.2
 */
export interface Biometry extends StatefulComponent<BiometryState>, MountableComponent {
  /**
   * @returns True if the SDK is initialized and biometry is supported.
   */
  isSupported: () => boolean;
  /**
   * True if biometry is available on the current device.
   */
  isAvailable: Computed<boolean>;
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
   * Authenticates the user using biometry. Requires the component to be mounted.
   * @param options - additional options.
   * @returns Authentication status and the saved token, `BiometryUnavailableError` if biometry
   * is unavailable, or `TimeoutError` if the user didn't respond in time.
   */
  safeAuthenticate: (
    options?: BiometryReasonOptions,
  ) => Promise<Result<BiometryUnavailableError | TimeoutError, BiometryAuthenticateResult>>;
  /**
   * Throwing version of `safeAuthenticate`.
   * @throws {BiometryUnavailableError} Biometry is unavailable.
   * @throws {TimeoutError} The user didn't respond in time.
   */
  authenticate: (options?: BiometryReasonOptions) => Promise<BiometryAuthenticateResult>;
  /**
   * Requests the permission to use biometry. Requires the component to be mounted.
   * @param options - additional options.
   * @returns True if the permission was granted, `BiometryUnavailableError` if biometry is
   * unavailable, or `TimeoutError` if the user didn't respond in time.
   */
  safeRequestAccess: (
    options?: BiometryReasonOptions,
  ) => Promise<Result<BiometryUnavailableError | TimeoutError, boolean>>;
  /**
   * Throwing version of `safeRequestAccess`.
   * @throws {BiometryUnavailableError} Biometry is unavailable.
   * @throws {TimeoutError} The user didn't respond in time.
   */
  requestAccess: (options?: BiometryReasonOptions) => Promise<boolean>;
  /**
   * Updates the token saved in the device storage. Requires the component to be mounted.
   * @param options - additional options.
   * @returns Update status, or `TimeoutError` if the user didn't respond in time.
   */
  safeUpdateToken: (
    options?: BiometryUpdateTokenOptions,
  ) => Promise<Result<TimeoutError, BiometryTokenUpdateStatus>>;
  /**
   * Throwing version of `safeUpdateToken`.
   * @throws {TimeoutError} The user didn't respond in time.
   */
  updateToken: (options?: BiometryUpdateTokenOptions) => Promise<BiometryTokenUpdateStatus>;
  /**
   * Opens the biometry settings. Use it when the user denied the access, but the mini app needs
   * it. Call it only in response to the user interaction.
   */
  openSettings: () => void;
}

function toState(payload: EventPayload<'biometry_info_received'>): BiometryState {
  return payload.available
    ? {
      available: true,
      accessGranted: payload.access_granted,
      accessRequested: payload.access_requested,
      deviceId: payload.device_id,
      tokenSaved: payload.token_saved,
      type: payload.type,
    }
    : {
      available: false,
      accessGranted: false,
      accessRequested: false,
      deviceId: '',
      tokenSaved: false,
      type: 'unknown',
    };
}

/**
 * @internal
 */
export function createBiometry(): Biometry {
  const core = createComponentCore<BiometryState>('biometry', toState({ available: false }));
  const { state } = core;
  let stopListening: VoidFunction | undefined;

  const requireMounted = () => {
    const globals = requireMethod('web_app_biometry_request_auth');
    core.assertMounted();
    return globals;
  };

  // Responses of concurrent requests can't be distinguished, so only one request is allowed.
  let isRequesting = false;
  const exclusive = <A extends any[], R>(fn: (...args: A) => Promise<R>) => {
    return async (...args: A): Promise<R> => {
      if (isRequesting) {
        throw new ConcurrentCallError('Another biometry request is in progress');
      }
      isRequesting = true;
      try {
        return await fn(...args);
      } finally {
        isRequesting = false;
      }
    };
  };

  const asyncMount = createAsyncMount(core, async options => {
    const response = await safeRequest('web_app_biometry_get_info', 'biometry_info_received', {
      ...options,
      postEvent: getGlobals().postEvent,
    });
    return response.ok ? ok(toState(response.data)) : response;
  }, () => {
    stopListening = onEvent('biometry_info_received', payload => state.set(toState(payload)));
  });
  const safeMount = async (options?: AsyncOptions) => {
    requireMethod('web_app_biometry_get_info');
    return asyncMount.safeMount(options);
  };

  const safeAuthenticate: Biometry['safeAuthenticate'] = exclusive(async ({
    reason,
    ...options
  } = {}) => {
    const { postEvent } = requireMounted();
    if (!state.get().available) {
      return err(new BiometryUnavailableError());
    }
    const response = await safeRequest('web_app_biometry_request_auth', 'biometry_auth_requested', {
      ...options,
      params: { reason: (reason || '').trim() },
      postEvent,
    });
    return response.ok
      ? ok({ status: response.data.status, token: response.data.token })
      : response;
  });

  const safeRequestAccess: Biometry['safeRequestAccess'] = exclusive(async ({
    reason,
    ...options
  } = {}) => {
    const { postEvent } = requireMounted();
    const response = await safeRequest(
      'web_app_biometry_request_access',
      'biometry_info_received',
      { ...options, params: { reason: (reason || '').trim() }, postEvent },
    );
    if (!response.ok) {
      return response;
    }
    const next = toState(response.data);
    state.set(next);
    return next.available ? ok(next.accessGranted) : err(new BiometryUnavailableError());
  });

  const safeUpdateToken: Biometry['safeUpdateToken'] = exclusive(async (options = {}) => {
    const { postEvent } = requireMounted();
    const { token, reason, ...rest } = options;
    const response = await safeRequest('web_app_biometry_update_token', 'biometry_token_updated', {
      ...rest,
      params: { token: token || '', reason: reason && reason.trim() },
      postEvent,
    });
    if (!response.ok) {
      return response;
    }
    const { status } = response.data;
    status === 'updated' && state.update({ tokenSaved: true });
    status === 'removed' && state.update({ tokenSaved: false });
    return ok(status);
  });

  return {
    isSupported: () => isMethodSupported('web_app_biometry_request_auth'),
    isAvailable: computedPick(state, 'available'),
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
    safeAuthenticate,
    authenticate: throwing(safeAuthenticate),
    safeRequestAccess,
    requestAccess: throwing(safeRequestAccess),
    safeUpdateToken,
    updateToken: throwing(safeUpdateToken),
    openSettings() {
      requireMethod('web_app_biometry_open_settings').postEvent('web_app_biometry_open_settings');
    },
  };
}

/**
 * Biometric authentication.
 * @since Mini Apps v7.2
 */
export const biometry = /* @__PURE__ */ createBiometry();
