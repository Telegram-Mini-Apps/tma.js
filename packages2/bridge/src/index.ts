export { matchError } from 'error-kid';

export { hasWebviewProxy, isIframe } from './env.js';
export {
  InvalidLaunchParamsError,
  InvokeCustomMethodFailedError,
  LaunchParamsRetrieveError,
  MethodParameterUnsupportedError,
  MethodUnsupportedError,
  StartParamTooLongError,
  TimeoutError,
  UnknownEnvError,
} from './errors.js';
export {
  emitEvent,
  offAll,
  offAnyEvent,
  offEvent,
  onAnyEvent,
  onEvent,
  type EmitEventArgs,
  type OnOptions,
} from './events.js';
export {
  invokeCustomMethod,
  safeInvokeCustomMethod,
  type InvokeCustomMethodOptions,
} from './invokeCustomMethod.js';
export { isTMA, isTMAAsync } from './isTMA.js';
export {
  parseLaunchParams,
  retrieveLaunchParams,
  retrieveRawInitData,
  retrieveRawLaunchParams,
  safeParseLaunchParams,
  safeRetrieveLaunchParams,
  safeRetrieveRawInitData,
  safeRetrieveRawLaunchParams,
  serializeLaunchParams,
  type LaunchParams,
} from './launch-params.js';
export { getLogger, isDebug, setDebug, setLogger, type Logger } from './logger.js';
export {
  mockTelegramEnv,
  type MockedMethodCall,
  type MockTelegramEnvOptions,
} from './mockTelegramEnv.js';
export { getTargetOrigin, postEvent, setTargetOrigin, type PostEventFn } from './postEvent.js';
export {
  captureSameReq,
  createRequestId,
  request,
  safeRequest,
  type RequestFnArgs,
  type RequestFnOptions,
  type RequestOptions,
  type RequestResult,
} from './request.js';
export {
  createStartParam,
  decodeBase64Url,
  decodeStartParam,
  encodeBase64Url,
  isSafeToCreateStartParam,
  safeCreateStartParam,
} from './start-param.js';
export type { Result } from './result.js';
export {
  compareVersions,
  createPostEvent,
  getReleaseVersion,
  supports,
  type MethodNameWithVersionedParams,
  type MethodVersionedParam,
  type OnUnsupportedFn,
} from './versions.js';
export type * from './types/index.js';
