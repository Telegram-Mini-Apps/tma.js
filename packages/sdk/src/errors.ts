import { errorClass, errorClassWithData } from 'error-kid';

/**
 * Thrown when a function requiring the SDK to be initialized is called before `init`.
 */
export class NotInitializedError extends /* @__PURE__ */ errorClass({
  message: 'The SDK is not initialized. Call the init function first',
  name: 'NotInitializedError',
}) {
}

/**
 * Thrown when a component method requiring the component to be mounted is called before
 * `mount`.
 */
export class NotMountedError extends /* @__PURE__ */ errorClassWithData({
  data: (component: string) => ({ component }),
  message: (component: string) => {
    return `The "${component}" component is not mounted. Call its mount method first`;
  },
  name: 'NotMountedError',
}) {
}

/**
 * Thrown when the current environment doesn't allow performing the operation.
 */
export class InvalidEnvError extends /* @__PURE__ */ errorClass({
  message: (message: string) => message,
  name: 'InvalidEnvError',
}) {
}

/**
 * Thrown when an operation is started while the previous one is still in progress. For example,
 * when opening a popup while another one is opened.
 */
export class ConcurrentCallError extends /* @__PURE__ */ errorClass({
  message: (message: string) => message,
  name: 'ConcurrentCallError',
}) {
}

/**
 * Thrown when CSS variables of a component are bound twice.
 */
export class CSSVarsBoundError extends /* @__PURE__ */ errorClass({
  message: 'CSS variables are already bound',
  name: 'CSSVarsBoundError',
}) {
}

/**
 * Returned when function arguments are invalid.
 */
export class InvalidArgumentsError extends /* @__PURE__ */ errorClass({
  cause: (_message: string, cause?: unknown) => cause,
  message: (message: string) => message,
  name: 'InvalidArgumentsError',
}) {
}

/**
 * Returned when the Telegram client responded with an unexpected value.
 */
export class InvalidResponseError extends /* @__PURE__ */ errorClassWithData({
  cause: (_value: unknown, cause?: unknown) => cause,
  data: (value: unknown) => ({ value }),
  message: (value: unknown) => `Unexpected response received: ${JSON.stringify(value)}`,
  name: 'InvalidResponseError',
}) {
}

/**
 * Returned when a color can't be parsed.
 */
export class InvalidColorError extends /* @__PURE__ */ errorClassWithData({
  data: (color: string) => ({ color }),
  message: (color: string) => `Invalid color: ${color}`,
  name: 'InvalidColorError',
}) {
}

/**
 * Returned when a theme parameters key has no color in the current theme.
 */
export class UnknownThemeParamsKeyError extends /* @__PURE__ */ errorClassWithData({
  data: (key: string) => ({ key }),
  message: (key: string) => `Theme parameters have no color with the "${key}" key`,
  name: 'UnknownThemeParamsKeyError',
}) {
}

/**
 * Returned when the user denied the requested action.
 */
export class AccessDeniedError extends /* @__PURE__ */ errorClass({
  message: (message: string) => message,
  name: 'AccessDeniedError',
}) {
}

/**
 * Returned when biometry is unavailable on the current device.
 */
export class BiometryUnavailableError extends /* @__PURE__ */ errorClass({
  message: 'Biometry is unavailable on the current device',
  name: 'BiometryUnavailableError',
}) {
}

/**
 * Returned when the Telegram client failed to enter or exit fullscreen mode.
 */
export class FullscreenFailedError extends /* @__PURE__ */ errorClassWithData({
  data: (error: string) => ({ error }),
  message: (error: string) => `Fullscreen request failed: ${error}`,
  name: 'FullscreenFailedError',
}) {
}

/**
 * Returned when the Telegram client failed to set the emoji status.
 */
export class SetEmojiStatusError extends /* @__PURE__ */ errorClassWithData({
  data: (error: string) => ({ error }),
  message: (error: string) => `Failed to set emoji status: ${error}`,
  name: 'SetEmojiStatusError',
}) {
}

/**
 * Returned when the Telegram client failed to share the prepared message.
 */
export class ShareMessageError extends /* @__PURE__ */ errorClassWithData({
  data: (error: string) => ({ error }),
  message: (error: string) => `Failed to share message: ${error}`,
  name: 'ShareMessageError',
}) {
}

/**
 * Returned when the Telegram client failed to request a chat.
 */
export class RequestChatError extends /* @__PURE__ */ errorClassWithData({
  data: (error: string) => ({ error }),
  message: (error: string) => `Failed to request chat: ${error}`,
  name: 'RequestChatError',
}) {
}

/**
 * Returned when a device storage method failed.
 */
export class DeviceStorageMethodError extends /* @__PURE__ */ errorClassWithData({
  data: (error: string) => ({ error }),
  message: (error: string) => `Device storage method failed: ${error}`,
  name: 'DeviceStorageMethodError',
}) {
}

/**
 * Returned when a secure storage method failed.
 */
export class SecureStorageMethodError extends /* @__PURE__ */ errorClassWithData({
  data: (error: string) => ({ error }),
  message: (error: string) => `Secure storage method failed: ${error}`,
  name: 'SecureStorageMethodError',
}) {
}

export interface ServerlessErrorData {
  /**
   * Additional data passed by the endpoint along with its `EndpointError`.
   */
  parameters?: unknown;
  /**
   * HTTP status code of the response, or 0 if the request could not be completed.
   */
  status: number;
  /**
   * `ENDPOINT_ERROR` if the endpoint refused the call by throwing an `EndpointError`.
   */
  type?: string;
}

/**
 * Returned when a serverless endpoint call failed.
 */
export class ServerlessError extends /* @__PURE__ */ errorClassWithData({
  cause: (_message: string, _data: ServerlessErrorData, cause?: unknown) => cause,
  data: (_message: string, data: ServerlessErrorData) => data,
  message: (message: string) => message,
  name: 'ServerlessError',
}) {
}
