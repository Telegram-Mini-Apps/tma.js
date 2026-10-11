//#region env
export { hasWebviewProxy } from '@/env/hasWebviewProxy.js';
export { isIframe } from '@/env/isIframe.js';
export { isTMA, isTMAFp, type isTMAError } from '@/env/isTMA.js';
export { mockTelegramEnv } from '@/env/mockTelegramEnv.js';
//#endregion

//#region events
export { off, offAll, on } from '@/events/emitter.js';
export { emitEvent } from '@/events/emitEvent.js';
export type {
  EventListener,
  SubscribeListener,
  Events,
  WriteAccessRequestedStatus,
  EmojiStatusAccessRequestedStatus,
  BiometryAuthRequestStatus,
  BiometryTokenUpdateStatus,
  BiometryType,
  EmojiStatusFailedError,
  EventName,
  EventPayload,
  EventWithoutPayload,
  EventWithPayload,
  PhoneRequestedStatus,
  FullScreenErrorStatus,
  HomeScreenStatus,
  InvoiceStatus,
  SafeAreaInsets,
} from '@/events/types/index.js';
//#endregion

//#region methods
export { captureSameReq } from '@/methods/captureSameReq.js';
export {
  createPostEvent,
  type CreatePostEventMode,
  type OnUnsupportedFn,
} from '@/methods/createPostEvent.js';
export { getReleaseVersion } from '@/methods/getReleaseVersion.js';
export {
  postEvent,
  postEventFp,
  type PostEventFn,
  type PostEventFpFn,
  type PostEventError,
} from '@/methods/postEvent.js';
export { postMessage, type PostMessage } from '@/methods/postMessage.js';
export { supports } from '@/methods/supports.js';
export type {
  AnyHapticFeedbackParams,
  AnyInvokeCustomMethodParams,
  CreateMethodParams,
  CustomMethodName,
  ImpactHapticFeedbackParams,
  ImpactHapticFeedbackStyle,
  CustomMethodsParams,
  CustomMethodParams,
  MethodName,
  MethodVersionedParams,
  NotificationHapticFeedbackParams,
  NotificationHapticFeedbackType,
  Methods,
  SelectionHapticFeedbackParams,
  MethodNameWithOptionalParams,
  MethodNameWithoutParams,
  MethodNameWithRequiredParams,
  MethodNameWithVersionedParams,
  MethodParams,
  PopupParams,
  BackgroundColor,
  BottomBarColor,
  HeaderColorKey,
  PopupButton,
  OpenLinkBrowser,
  SecondaryButtonPosition,
  SwitchInlineQueryChatType,
} from '@/methods/types/index.js';
//#endregion

//#region utils
export { compareVersions } from '@/utils/compareVersions.js';
export {
  invokeCustomMethod,
  invokeCustomMethodFp,
  type InvokeCustomMethodFn,
  type InvokeCustomMethodOptions,
  type InvokeCustomMethodFpFn,
  type InvokeCustomMethodError,
  type InvokeCustomMethodFpOptions,
} from '@/utils/invokeCustomMethod.js';
export {
  request,
  requestFp,
  type RequestCaptureEventFn,
  type RequestCaptureEventsFn,
  type RequestCaptureFn,
  type RequestCaptureFnEventsPayload,
  type RequestFn,
  type RequestOptions,
  type RequestResult,
  type RequestError,
  type RequestFpOptions,
  type RequestFpFn,
} from '@/utils/request.js';
export {
  request2,
  request2Fp,
  type Request2CaptureEventFn,
  type Request2CaptureEventsFn,
  type Request2CaptureFn,
  type Request2CaptureFnEventsPayload,
  type Request2Fn,
  type Request2Options,
  type Request2Result,
  type Request2Error,
  type Request2FpOptions,
  type Request2FpFn,
} from '@/utils/request2.js';
//#endregion

//#region misc
export { applyPolyfills } from '@/applyPolyfills.js';
export {
  decodeBase64Url,
  encodeBase64Url,
  decodeBase64UrlFp,
  type DecodeBase64UrlError,
} from '@/base64-url.js';
export {
  LaunchParamsRetrieveError,
  InvalidLaunchParamsError,
  InvokeCustomMethodFailedError,
  MethodParameterUnsupportedError,
  MethodUnsupportedError,
  UnknownEnvError,
} from '@/errors.js';
export {
  setDebug,
  debug,
  resetGlobals,
  postMessageImpl,
  logger,
  setTargetOrigin,
  targetOrigin,
} from '@/globals.js';
export {
  retrieveLaunchParams,
  retrieveRawInitData,
  retrieveRawInitDataFp,
  retrieveRawLaunchParams,
  retrieveRawLaunchParamsFp,
  retrieveLaunchParamsFp,
  type RetrieveLaunchParamsError,
  type RetrieveLaunchParamsResult,
  type RetrieveRawInitDataError,
  type RetrieveRawLaunchParamsError,
} from '@/launch-params.js';
export {
  createStartParam,
  createStartParamFp,
  decodeStartParam,
  decodeStartParamFp,
  isSafeToCreateStartParam,
} from '@/start-param.js';
//#endregion

//#region Re-exports
export {
  createLogger,
  deepSnakeToCamelObjKeys,
  type DeepConvertSnakeKeysToCamelCase,
  type Logger,
  type LoggerFn,
  type LoggerForceFn,
  type LoggerOptions,
  type LogLevel,
} from '@tma.js/toolkit';
export {
  CancelledError,
  TimeoutError,
} from 'better-promises';
//#endregion
