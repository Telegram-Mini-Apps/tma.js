import {
  compareVersions,
  getReleaseVersion,
  type LaunchParams,
  type MethodName,
  MethodUnsupportedError,
  type PostEventFn,
  supports,
  type Version,
} from '@tma.js/bridge';

import { NotInitializedError } from './errors.js';

/**
 * Values configured by the `init` function and used across the package.
 */
export interface Globals {
  /**
   * Launch parameters of the current mini app.
   */
  launchParams: LaunchParams;
  /**
   * Function calling Mini Apps methods.
   */
  postEvent: PostEventFn;
  /**
   * Mini Apps version supported by the Telegram client.
   */
  version: Version;
}

let globals: Globals | undefined;

/**
 * @internal
 */
export function setGlobals(value: Globals | undefined): void {
  globals = value;
}

/**
 * @returns True if the SDK is initialized.
 */
export function isInitialized(): boolean {
  return !!globals;
}

/**
 * @returns Values configured by the `init` function.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @internal
 */
export function getGlobals(): Globals {
  if (!globals) {
    throw new NotInitializedError();
  }
  return globals;
}

/**
 * @returns True if the SDK is initialized and the method is supported by the Telegram client.
 * @param method - method name.
 * @internal
 */
export function isMethodSupported(method: MethodName): boolean {
  return !!globals && supports(method, globals.version);
}

/**
 * @returns True if the SDK is initialized and the method parameter is supported by the Telegram
 * client. If the parameter was released together with the method, the method support is checked.
 * @param method - method name.
 * @param param - method parameter.
 * @internal
 */
export function isParamSupported(method: MethodName, param: string): boolean {
  // Bridge types accept only known versioned parameters, while this function accepts any.
  const released = (getReleaseVersion as (method: string, param: string) => Version | undefined)(
    method,
    param,
  );
  return released
    ? !!globals && compareVersions(released, globals.version) <= 0
    : isMethodSupported(method);
}

/**
 * Checks if the method is supported by the Telegram client.
 * @returns Values configured by the `init` function.
 * @param method - method name.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @internal
 */
export function requireMethod(method: MethodName): Globals {
  const value = getGlobals();
  if (!supports(method, value.version)) {
    throw new MethodUnsupportedError(method, value.version);
  }
  return value;
}
