import { errorClass, errorClassWithData } from 'error-kid';
import type { BaseIssue } from 'valibot';

function msgToTuple(message?: string): [string?] {
  return [message];
}

export class ValidationError extends /* #__PURE__ */ errorClassWithData<
  { input: unknown; issues: BaseIssue<any>[] },
  [input: unknown, issues: BaseIssue<any>[]]
>(
  'ValidationError',
  (input, issues) => ({ input, issues }),
  'Validation error',
) {
}

export class CSSVarsBoundError extends /* #__PURE__ */ errorClass(
  'CSSVarsBoundError',
  'CSS variables are already bound',
) {
}

export class DeviceStorageMethodError extends /* #__PURE__ */ errorClassWithData<
  { error: string },
  [error: string]
>('DeviceStorageMethodError', error => ({ error }), error => [error]) {
}

export class SecureStorageMethodError extends /* #__PURE__ */ errorClassWithData<
  { error: string },
  [error: string]
>('SecureStorageMethodError', error => ({ error }), error => [error]) {
}

export class NotAvailableError extends /* #__PURE__ */ errorClass<[message: string]>(
  'NotAvailableError',
  msgToTuple,
) {
}

export class InvalidEnvError extends /* #__PURE__ */ errorClass<[message?: string]>(
  'InvalidEnvError',
  msgToTuple,
) {
}

export class FunctionUnavailableError extends /* #__PURE__ */ errorClass<[message?: string]>(
  'FunctionNotAvailableError',
  msgToTuple,
) {
}

export class InvalidArgumentsError extends /* #__PURE__ */ errorClass<[message: string, cause?: unknown]>(
  'InvalidArgumentsError',
  (message, cause) => [message, { cause }],
) {
}

export class ConcurrentCallError extends /* #__PURE__ */ errorClass<[message: string]>(
  'ConcurrentCallError',
  msgToTuple,
) {
}

export class SetEmojiStatusError extends /* #__PURE__ */ errorClass<[error: string]>(
  'SetEmojiStatusError',
  error => [`Failed to set emoji status: ${error}`],
) {
}

export class AccessDeniedError extends /* #__PURE__ */ errorClass<[message: string]>(
  'AccessDeniedError',
  msgToTuple,
) {
}

export class FullscreenFailedError extends /* #__PURE__ */ errorClass<[message: string]>(
  'FullscreenFailedError',
  msgToTuple,
) {
}

export class ShareMessageError extends /* #__PURE__ */ errorClass<[error: string]>(
  'ShareMessageError',
  msgToTuple,
) {
}

export class UnknownThemeParamsKeyError extends /* #__PURE__ */ errorClass<[key: string]>(
  'UnknownThemeParamsKeyError',
  key => [`Unknown theme params key passed: ${key}`],
) {
}
