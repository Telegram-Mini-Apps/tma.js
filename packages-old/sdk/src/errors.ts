import { errorClass, errorClassWithData } from 'error-kid';
import type { BaseIssue } from 'valibot';

function msgToTuple(message?: string): [string?] {
  return [message];
}

export class ValidationError extends /* #__PURE__ */ errorClassWithData<
  { input: unknown; issues: BaseIssue<any>[] },
  [input: unknown, issues: BaseIssue<any>[]]
>({
  name: 'ValidationError',
  data: (input, issues) => ({ input, issues }),
  super: 'Validation error',
}) {
}

export class CSSVarsBoundError extends /* #__PURE__ */ errorClass({
  name: 'CSSVarsBoundError',
  super: 'CSS variables are already bound',
}) {
}

export class DeviceStorageMethodError extends /* #__PURE__ */ errorClassWithData<
  { error: string },
  [error: string]
>({
  name: 'DeviceStorageMethodError',
  data: error => ({ error }),
  super: error => [error],
}) {
}

export class SecureStorageMethodError extends /* #__PURE__ */ errorClassWithData<
  { error: string },
  [error: string]
>({
  name: 'SecureStorageMethodError',
  data: error => ({ error }),
  super: error => [error],
}) {
}

export class NotAvailableError extends /* #__PURE__ */ errorClass<[message: string]>({
  name: 'NotAvailableError',
  super: msgToTuple,
}) {
}

export class InvalidEnvError extends /* #__PURE__ */ errorClass<[message?: string]>({
  name: 'InvalidEnvError',
  super: msgToTuple,
}) {
}

export class FunctionUnavailableError extends /* #__PURE__ */ errorClass<[message?: string]>({
  name: 'FunctionNotAvailableError',
  super: msgToTuple,
}) {
}

export class InvalidArgumentsError extends /* #__PURE__ */ errorClass<[message: string, cause?: unknown]>({
  name: 'InvalidArgumentsError',
  super: (message, cause) => [message, { cause }],
}) {
}

export class ConcurrentCallError extends /* #__PURE__ */ errorClass<[message: string]>({
  name: 'ConcurrentCallError',
  super: msgToTuple,
}) {
}

export class SetEmojiStatusError extends /* #__PURE__ */ errorClass<[error: string]>({
  name: 'SetEmojiStatusError',
  super: error => [`Failed to set emoji status: ${error}`],
}) {
}

export class AccessDeniedError extends /* #__PURE__ */ errorClass<[message: string]>({
  name: 'AccessDeniedError',
  super: msgToTuple,
}) {
}

export class FullscreenFailedError extends /* #__PURE__ */ errorClass<[message: string]>({
  name: 'FullscreenFailedError',
  super: msgToTuple,
}) {
}

export class ShareMessageError extends /* #__PURE__ */ errorClass<[error: string]>({
  name: 'ShareMessageError',
  super: msgToTuple,
}) {
}

export class RequestChatError extends /* #__PURE__ */ errorClass<[error: string]>({
  name: 'RequestChatError',
  super: msgToTuple,
}) {
}

export interface ServerlessErrorData {
  /**
   * HTTP status code of the response, or 0 if the request could not be completed.
   */
  status: number;
  /**
   * "ENDPOINT_ERROR" if the endpoint refused the call by throwing an EndpointError.
   */
  type?: string;
  /**
   * Additional data passed by the endpoint along with its EndpointError.
   */
  parameters?: unknown;
}

export class ServerlessError extends /* #__PURE__ */ errorClassWithData<
  ServerlessErrorData,
  [message: string, options: ServerlessErrorData & { cause?: unknown }]
>({
  name: 'ServerlessError',
  data: (_, { status, type, parameters }) => ({ status, type, parameters }),
  super: (message, { cause }) => [message, { cause }],
}) {
}

export class UnknownThemeParamsKeyError extends /* #__PURE__ */ errorClass<[key: string]>({
  name: 'UnknownThemeParamsKeyError',
  super: key => [`Unknown theme params key passed: ${key}`],
}) {
}
