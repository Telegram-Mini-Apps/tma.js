import type {
  InvokeCustomMethodFailedError,
  LaunchParamsRetrieveError,
  Result,
  TimeoutError,
} from '@tma.js/bridge';
import type { InvalidInitDataError } from '@tma.js/init-data';
import { matchError } from 'error-kid';
import { expectTypeOf } from 'vitest';

import { safeIsColorDark, safeToRGB } from './colors.js';
import { biometry } from './components/biometry/biometry.js';
import { cloudStorage } from './components/cloudStorage/cloudStorage.js';
import { deviceStorage } from './components/deviceStorage/deviceStorage.js';
import { initData } from './components/initData/initData.js';
import { invoice } from './components/invoice/invoice.js';
import { mainButton } from './components/mainButton/mainButton.js';
import { miniApp } from './components/miniApp/miniApp.js';
import { popup } from './components/popup/popup.js';
import { qrScanner } from './components/qrScanner/qrScanner.js';
import { secureStorage } from './components/secureStorage/secureStorage.js';
import { serverless } from './components/serverless/serverless.js';
import { viewport } from './components/viewport/viewport.js';
import type { BottomButtonFeature } from './createBottomButton.js';
import type {
  AccessDeniedError,
  BiometryUnavailableError,
  DeviceStorageMethodError,
  FullscreenFailedError,
  InvalidArgumentsError,
  InvalidColorError,
  InvalidResponseError,
  RequestChatError,
  SecureStorageMethodError,
  ServerlessError,
  SetEmojiStatusError,
  ShareMessageError,
  UnknownThemeParamsKeyError,
} from './errors.js';
import { safeDownloadFile } from './functions/downloadFile/downloadFile.js';
import { safeSetEmojiStatus } from './functions/emoji-status/emoji-status.js';
import { safeGetCurrentTime } from './functions/getCurrentTime/getCurrentTime.js';
import { openLink, safeOpenLink, safeOpenTelegramLink } from './functions/links/links.js';
import { safeRequestContact } from './functions/privacy/privacy.js';
import { safeRequestChat } from './functions/requestChat/requestChat.js';
import { safeSendData } from './functions/sendData/sendData.js';
import { safeShareMessage } from './functions/shareMessage/shareMessage.js';
import { safeInit } from './init.js';

type ErrorOf<T> = Awaited<T> extends Result<infer E, any> ? E : never;

// The function is never called. The file is checked by the TypeScript compiler only.
export function checkTypes(): void {
  expectTypeOf<ErrorOf<ReturnType<typeof safeInit>>>().toEqualTypeOf<LaunchParamsRetrieveError>();
  expectTypeOf<ErrorOf<ReturnType<typeof safeToRGB>>>().toEqualTypeOf<InvalidColorError>();
  expectTypeOf<ErrorOf<ReturnType<typeof safeIsColorDark>>>().toEqualTypeOf<InvalidColorError>();

  // Components.
  expectTypeOf<ErrorOf<ReturnType<typeof viewport.safeMount>>>().toEqualTypeOf<TimeoutError>();
  expectTypeOf<ErrorOf<ReturnType<typeof viewport.safeRequestFullscreen>>>()
    .toEqualTypeOf<FullscreenFailedError | TimeoutError>();
  expectTypeOf<ErrorOf<ReturnType<typeof miniApp.safeSetHeaderColor>>>()
    .toEqualTypeOf<UnknownThemeParamsKeyError>();
  expectTypeOf<ErrorOf<ReturnType<typeof popup.safeShow>>>()
    .toEqualTypeOf<InvalidArgumentsError | TimeoutError>();
  expectTypeOf<ErrorOf<ReturnType<typeof invoice.safeOpenUrl>>>()
    .toEqualTypeOf<InvalidArgumentsError | TimeoutError>();
  expectTypeOf<ErrorOf<ReturnType<typeof qrScanner.safeCapture>>>().toEqualTypeOf<TimeoutError>();
  expectTypeOf<ErrorOf<ReturnType<typeof biometry.safeAuthenticate>>>()
    .toEqualTypeOf<BiometryUnavailableError | TimeoutError>();
  expectTypeOf<ErrorOf<ReturnType<typeof cloudStorage.safeGetKeys>>>()
    .toEqualTypeOf<InvalidResponseError | InvokeCustomMethodFailedError | TimeoutError>();
  expectTypeOf<ErrorOf<ReturnType<typeof deviceStorage.safeGetItem>>>()
    .toEqualTypeOf<DeviceStorageMethodError | TimeoutError>();
  expectTypeOf<ErrorOf<ReturnType<typeof secureStorage.safeGetItem>>>()
    .toEqualTypeOf<SecureStorageMethodError | TimeoutError>();
  expectTypeOf<ErrorOf<ReturnType<typeof initData.safeRestore>>>()
    .toEqualTypeOf<InvalidInitDataError>();
  expectTypeOf<ErrorOf<ReturnType<typeof serverless.safeCall>>>()
    .toEqualTypeOf<InvalidArgumentsError | ServerlessError>();

  // Functions.
  expectTypeOf<ErrorOf<ReturnType<typeof safeOpenLink>>>().toEqualTypeOf<InvalidArgumentsError>();
  expectTypeOf<ErrorOf<ReturnType<typeof safeOpenTelegramLink>>>()
    .toEqualTypeOf<InvalidArgumentsError>();
  expectTypeOf<ErrorOf<ReturnType<typeof safeSendData>>>().toEqualTypeOf<InvalidArgumentsError>();
  expectTypeOf<ErrorOf<ReturnType<typeof safeDownloadFile>>>()
    .toEqualTypeOf<AccessDeniedError | TimeoutError>();
  expectTypeOf<ErrorOf<ReturnType<typeof safeGetCurrentTime>>>()
    .toEqualTypeOf<InvalidResponseError | InvokeCustomMethodFailedError | TimeoutError>();
  expectTypeOf<ErrorOf<ReturnType<typeof safeRequestChat>>>()
    .toEqualTypeOf<RequestChatError | TimeoutError>();
  expectTypeOf<ErrorOf<ReturnType<typeof safeShareMessage>>>()
    .toEqualTypeOf<ShareMessageError | TimeoutError>();
  expectTypeOf<ErrorOf<ReturnType<typeof safeSetEmojiStatus>>>()
    .toEqualTypeOf<SetEmojiStatusError | TimeoutError>();
  expectTypeOf<ErrorOf<ReturnType<typeof safeRequestContact>>>()
    .toEqualTypeOf<AccessDeniedError | InvalidResponseError | TimeoutError>();

  // Values.
  expectTypeOf(mainButton.bgColor()).toEqualTypeOf<`#${string}`>();
  expectTypeOf(serverless.call<{ a: number }>('a')).resolves.toEqualTypeOf<{ a: number }>();

  // Support checks.
  expectTypeOf(miniApp.setHeaderColor.supports).parameter(0)
    .toEqualTypeOf<'rgb'>();
  expectTypeOf(miniApp.safeSetHeaderColor.supports).parameter(0)
    .toEqualTypeOf<'rgb'>();
  expectTypeOf(mainButton.setParams.supports).parameter(0)
    .toEqualTypeOf<BottomButtonFeature>();
  expectTypeOf(openLink.supports).parameter(0)
    .toEqualTypeOf<'tryInstantView' | 'tryBrowser'>();
  expectTypeOf(viewport.requestFullscreen.isSupported).toEqualTypeOf<() => boolean>();
  // @ts-expect-error The setter has no features released later than the method itself.
  void miniApp.setBgColor.supports;

  // Values are readonly.
  expectTypeOf(() => {
    // @ts-expect-error Insets are readonly.
    viewport.safeAreaInsets().top = 0;
    // @ts-expect-error State is readonly.
    viewport.state().height = 0;
  }).toBeFunction();

  // Errors are matched exhaustively.
  expectTypeOf(async () => {
    const result = await popup.safeShow({ message: 'm' });
    if (!result.ok) {
      matchError(result.error, {
        InvalidArgumentsError: () => undefined,
        TimeoutError: () => undefined,
      });
      // @ts-expect-error TimeoutError is not handled.
      matchError(result.error, { InvalidArgumentsError: () => undefined });
    }
  });
}
