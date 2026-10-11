import type { BiometryType, EventListener } from '@tma.js/bridge';
import type { Maybe } from '@tma.js/toolkit';

import type { SharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import type { WithPostEvent } from '@/fn-options/withPostEvent.js';
import type { WithRequest } from '@/fn-options/withRequest.js';
import type { WithStateRestore } from '@/fn-options/withStateRestore.js';
import type { WithVersion } from '@/fn-options/withVersion.js';
import type { AsyncOptions } from '@/types.js';

export interface BiometryState {
  /**
   * If true, indicates that biometric authentication is available on the current device.
   */
  available: boolean;
  /**
   * Indicates whether the app has previously requested permission to use biometrics.
   */
  accessRequested: boolean;
  /**
   * Indicates whether the user has granted the app permission to use biometrics.
   *
   * If false and access_requested is true may indicate that:
   *
   * - The user has simply canceled the permission popup, in which case
   * a `web_app_biometry_request_access` event can be emitted to re-open the popup.
   *
   * - The user has denied the app permission to use biometrics, in which case the app should
   * open a prompt notifying the user that the biometric settings must be changed to use
   * biometrics.
   */
  accessGranted: boolean;
  /**
   * A unique device identifier that can be used to match the token to the device.
   */
  deviceId: string;
  /**
   * Show whether a token was safely stored on-device.
   */
  tokenSaved: boolean;
  /**
   * The type of biometrics currently available on the device.
   */
  type: BiometryType;
  /**
   * Last retrieved token.
   */
  token?: string;
}

export interface BiometryAuthenticateOptions extends AsyncOptions {
  /**
   * Reason to request biometry data. Should be at least 1 symbol length, but not more than
   * 128 symbols.
   */
  reason?: Maybe<string>;
}

export interface BiometryUpdateTokenOptions extends AsyncOptions {
  /**
   * Optional string field, containing the reason why the bot is asking to authenticate using biometrics (1-128 chars, used in the prompt).
   */
  reason?: string;
  /**
   * Token to save in the local device secure storage. Passing `null`, `undefined` or empty string
   * removes it from the storage.
   */
  token?: Maybe<string>;
}

export interface BiometryRequestAccessOptions extends AsyncOptions {
  /**
   * The text to be displayed to a user in the popup describing why the bot needs access to
   * biometrics, 0-128 characters.
   */
  reason?: Maybe<string>;
}

export interface BiometryOptions extends WithVersion,
  WithStateRestore<BiometryState>,
  WithRequest,
  WithPostEvent,
  SharedFeatureOptions {
  /**
   * Adds a biometry info received event listener.
   * @param listener - a listener to add.
   */
  onInfoReceived: (listener: EventListener<'biometry_info_received'>) => void;
  /**
   * Removes a biometry info received event listener.
   * @param listener - a listener to add.
   */
  offInfoReceived: (listener: EventListener<'biometry_info_received'>) => void;
}
