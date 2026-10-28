export * from '@tma.js/bridge';
export {
  InvalidInitDataError,
  type Chat,
  type ChatType,
  type InitData,
  type User,
} from '@tma.js/init-data';

export { isColorDark, isRGB, safeIsColorDark, safeToRGB, toRGB } from './colors.js';
export {
  AccessDeniedError,
  BiometryUnavailableError,
  ConcurrentCallError,
  CSSVarsBoundError,
  DeviceStorageMethodError,
  FullscreenFailedError,
  InvalidArgumentsError,
  InvalidColorError,
  InvalidEnvError,
  InvalidResponseError,
  NotInitializedError,
  NotMountedError,
  RequestChatError,
  SecureStorageMethodError,
  ServerlessError,
  SetEmojiStatusError,
  ShareMessageError,
  UnknownThemeParamsKeyError,
  type ServerlessErrorData,
} from './errors.js';
export { isInitialized } from './globals.js';
export { init, safeInit, type InitOptions } from './init.js';
export type {
  IsSupported,
  Supports,
  WithIsSupported,
  WithSupports,
} from './is-supported.js';
export type { Computed, DeepReadonly } from './store.js';
export type { AsyncOptions, MountableComponent, StatefulComponent } from './types.js';

//#region Components.
export { backButton, type BackButton, type BackButtonState } from './components/backButton/backButton.js';
export type {
  BottomButton,
  BottomButtonFeature,
  BottomButtonState,
} from './createBottomButton.js';
export type { ButtonComponent } from './button.js';
export {
  biometry,
  type Biometry,
  type BiometryAuthenticateResult,
  type BiometryReasonOptions,
  type BiometryState,
  type BiometryUpdateTokenOptions,
} from './components/biometry/biometry.js';
export {
  closingBehavior,
  type ClosingBehavior,
  type ClosingBehaviorState,
} from './components/closingBehavior/closingBehavior.js';
export {
  cloudStorage,
  type CloudStorage,
  type CloudStorageError,
} from './components/cloudStorage/cloudStorage.js';
export {
  deviceStorage,
  type DeviceStorage,
  type DeviceStorageError,
} from './components/deviceStorage/deviceStorage.js';
export { hapticFeedback, type HapticFeedback } from './components/hapticFeedback/hapticFeedback.js';
export { initData, type InitDataComponent } from './components/initData/initData.js';
export { invoice, type Invoice } from './components/invoice/invoice.js';
export {
  locationManager,
  type LocationData,
  type LocationManager,
  type LocationManagerState,
} from './components/locationManager/locationManager.js';
export { mainButton, type MainButton, type MainButtonState } from './components/mainButton/mainButton.js';
export { miniApp } from './components/miniApp/miniApp.js';
export type { AnyColor, MiniApp, MiniAppState } from './components/miniApp/types.js';
export {
  popup,
  preparePopupParams,
  type Popup,
  type PopupShowButton,
  type PopupShowOptions,
} from './components/popup/popup.js';
export {
  qrScanner,
  type QrScanner,
  type QrScannerCaptureOptions,
  type QrScannerOpenOptions,
} from './components/qrScanner/qrScanner.js';
export {
  secondaryButton,
  type SecondaryButton,
  type SecondaryButtonState,
} from './components/secondaryButton/secondaryButton.js';
export {
  secureStorage,
  type SecureStorage,
  type SecureStorageError,
  type SecureStorageItem,
} from './components/secureStorage/secureStorage.js';
export {
  serverless,
  type Serverless,
  type ServerlessCallError,
  type ServerlessCallOptions,
} from './components/serverless/serverless.js';
export {
  settingsButton,
  type SettingsButton,
  type SettingsButtonState,
} from './components/settingsButton/settingsButton.js';
export {
  swipeBehavior,
  type SwipeBehavior,
  type SwipeBehaviorState,
} from './components/swipeBehavior/swipeBehavior.js';
export { themeParams, type ThemeParamsComponent } from './components/themeParams/themeParams.js';
export { viewport } from './components/viewport/viewport.js';
export type { Viewport, ViewportCSSVarKey, ViewportState } from './components/viewport/types.js';
//#endregion

//#region Functions.
export {
  retrieveAndroidDeviceData,
  retrieveAndroidDeviceDataFrom,
  type AndroidDeviceData,
} from './functions/android/android.js';
export {
  copyTextToClipboard,
  readTextFromClipboard,
  safeReadTextFromClipboard,
} from './functions/clipboard/clipboard.js';
export {
  requestEmojiStatusAccess,
  safeRequestEmojiStatusAccess,
  safeSetEmojiStatus,
  setEmojiStatus,
  type SetEmojiStatusOptions,
} from './functions/emoji-status/emoji-status.js';
export {
  addToHomeScreen,
  checkHomeScreenStatus,
  safeCheckHomeScreenStatus,
} from './functions/home-screen/home-screen.js';
export {
  isTelegramHostname,
  openLink,
  openTelegramLink,
  safeOpenLink,
  safeOpenTelegramLink,
  shareURL,
  type OpenLinkOptions,
  type OpenTelegramLinkOptions,
} from './functions/links/links.js';
export { downloadFile, safeDownloadFile } from './functions/downloadFile/downloadFile.js';
export { getCurrentTime, safeGetCurrentTime } from './functions/getCurrentTime/getCurrentTime.js';
export { hideKeyboard } from './functions/hideKeyboard/hideKeyboard.js';
export { requestChat, safeRequestChat } from './functions/requestChat/requestChat.js';
export { safeSendData, sendData } from './functions/sendData/sendData.js';
export { safeShareMessage, shareMessage } from './functions/shareMessage/shareMessage.js';
export { shareStory, type ShareStoryOptions } from './functions/shareStory/shareStory.js';
export { switchInlineQuery } from './functions/switchInlineQuery/switchInlineQuery.js';
export {
  requestContact,
  requestContactComplete,
  requestPhoneAccess,
  requestWriteAccess,
  safeRequestContact,
  safeRequestContactComplete,
  safeRequestPhoneAccess,
  safeRequestWriteAccess,
  type RequestContactError,
  type RequestedContact,
  type RequestedContactComplete,
} from './functions/privacy/privacy.js';
//#endregion
