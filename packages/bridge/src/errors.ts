import type { Version } from '@tma.js/types';
import { errorClass, errorClassWithData } from 'error-kid';

export class MethodUnsupportedError extends /* @__PURE__ */ errorClass<
  [method: string, version: Version]
>('MethodUnsupportedError', (method, version) => [
  `Method "${method}" is unsupported in Mini Apps version ${version}`,
]) {
}

export class MethodParameterUnsupportedError extends /* @__PURE__ */ errorClass<
  [method: string, param: string, version: Version]
>('MethodParameterUnsupportedError', (method, param, version) => [
  `Parameter "${param}" of "${method}" method is unsupported in Mini Apps version ${version}`,
]) {
}

export class LaunchParamsRetrieveError extends /* @__PURE__ */ errorClassWithData<
  { errors: { source: string; error: unknown }[] },
  [{ source: string; error: unknown }[]]
>(
  'LaunchParamsRetrieveError',
  errors => ({ errors }),
  errors => [
    [
      'Unable to retrieve launch parameters from any known source. Perhaps, you have opened your app outside Telegram?',
      '📖 Refer to docs for more information:',
      'https://docs.telegram-mini-apps.com/packages/tma-js-bridge/environment',
      '',
      'Collected errors:',
      ...errors.map(({ source, error }) => {
        return `Source: ${source} / ${error instanceof Error ? error.message : String(error)}`;
      }),
    ].join('\n'),
  ],
) {
}

export class InvalidLaunchParamsError extends /* @__PURE__ */ errorClass<
  [launchParams: string, cause: unknown]
>('InvalidLaunchParamsError', (launchParams, cause) => [
  `Invalid value for launch params: ${launchParams}`,
  { cause },
]) {
}

export class UnknownEnvError extends /* @__PURE__ */ errorClass('UnknownEnvError') {
}

export class InvokeCustomMethodFailedError extends /* @__PURE__ */ errorClass<[error: string]>(
  'InvokeCustomMethodError',
  error => [`Server returned error: ${error}`],
) {
}
