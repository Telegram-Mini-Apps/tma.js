import { errorClass, errorClassWithData } from 'error-kid';

import type { Version } from './types/index.js';

/**
 * Thrown when the current environment provides no known way to communicate with the Telegram
 * client. Usually, it means the app was opened outside Telegram.
 */
export class UnknownEnvError extends /* @__PURE__ */ errorClass({
  name: 'UnknownEnvError',
  message: 'Unable to determine the way to communicate with the Telegram client',
}) {
}

/**
 * Thrown when a method is not supported in the current Mini Apps version.
 */
export class MethodUnsupportedError extends /* @__PURE__ */ errorClassWithData({
  name: 'MethodUnsupportedError',
  data: (method: string, version: Version) => ({ method, version }),
  message: (method: string, version: Version) => {
    return `Method "${method}" is unsupported in Mini Apps version ${version}`;
  },
}) {
}

/**
 * Thrown when a method parameter is not supported in the current Mini Apps version.
 */
export class MethodParameterUnsupportedError extends /* @__PURE__ */ errorClassWithData({
  name: 'MethodParameterUnsupportedError',
  data: (method: string, param: string, version: Version) => ({ method, param, version }),
  message: (method: string, param: string, version: Version) => {
    return `Parameter "${param}" of "${method}" method is unsupported in Mini Apps version ${version}`;
  },
}) {
}

/**
 * Thrown when launch parameters can't be found in any known source.
 */
export class LaunchParamsRetrieveError extends /* @__PURE__ */ errorClassWithData({
  name: 'LaunchParamsRetrieveError',
  data: (errors: { source: string; error: unknown }[]) => ({ errors }),
  message: (errors: { source: string; error: unknown }[]) => [
    'Unable to retrieve launch parameters from any known source. Perhaps, you have opened your app outside Telegram?',
    '',
    'Collected errors:',
    ...errors.map(({ source, error }) => {
      return `- ${source}: ${error instanceof Error ? error.message : String(error)}`;
    }),
  ].join('\n'),
}) {
}

/**
 * Thrown when a value doesn't represent valid launch parameters.
 */
export class InvalidLaunchParamsError extends /* @__PURE__ */ errorClassWithData({
  name: 'InvalidLaunchParamsError',
  message: (value: string) => `Invalid launch parameters: ${value}`,
  cause: (_value: string, cause?: unknown) => cause,
  data: (value: string) => ({ value }),
}) {
}

/**
 * Thrown when a custom method invocation completed with an error.
 */
export class InvokeCustomMethodFailedError extends /* @__PURE__ */ errorClassWithData({
  name: 'InvokeCustomMethodFailedError',
  data: (error: string) => ({ error }),
  message: (error: string) => `Custom method invocation failed: ${error}`,
}) {
}

/**
 * Thrown when an operation didn't complete in time.
 */
export class TimeoutError extends /* @__PURE__ */ errorClassWithData({
  name: 'TimeoutError',
  data: (timeout: number) => ({ timeout }),
  message: (timeout: number) => `Timeout reached: ${timeout}ms`,
}) {
}

/**
 * Thrown when a value is too long to be used as a start parameter.
 */
export class StartParamTooLongError extends /* @__PURE__ */ errorClassWithData({
  name: 'StartParamTooLongError',
  data: (length: number) => ({ length }),
  message: (length: number) => {
    return `Encoded start parameter length is ${length}, but the maximum allowed is 512`;
  },
}) {
}
