import { err, ok, onEvent, type Result, throwing, TimeoutError } from '@tma.js/bridge';

import { ConcurrentCallError } from '../../errors.js';
import { getGlobals, isMethodSupported, requireMethod } from '../../globals.js';
import { createStore } from '../../store.js';
import type { AsyncOptions } from '../../types.js';

export interface QrScannerOpenOptions extends AsyncOptions {
  /**
   * Text displayed under the scanner, 0-64 characters.
   */
  text?: string;
  /**
   * Function called whenever a QR code is scanned. The scanner stays opened, call `close` to
   * close it.
   * @param qr - scanned QR code content.
   */
  onCaptured: (qr: string) => void;
}

export interface QrScannerCaptureOptions extends AsyncOptions {
  /**
   * Text displayed under the scanner, 0-64 characters.
   */
  text?: string;
  /**
   * @returns True if the scanned QR code should be captured. When it happens, the scanner is
   * closed. By default, the first scanned QR code is captured.
   * @param qr - scanned QR code content.
   */
  capture?: (qr: string) => boolean;
}

/**
 * Methods opening the scanner throw:
 * - `NotInitializedError` if the SDK is not initialized;
 * - `MethodUnsupportedError` if the scanner is unsupported;
 * - `ConcurrentCallError` if the scanner is already opened.
 *
 * When the timeout is reached or the operation is aborted, the scanner is closed.
 * @since Mini Apps v6.4
 */
export interface QrScanner {
  /**
   * @returns True if the SDK is initialized and the scanner is supported.
   */
  isSupported: () => boolean;
  /**
   * @returns True if the scanner is opened.
   */
  isOpened: () => boolean;
  /**
   * Subscribes to the `isOpened` value changes.
   * @param listener - function to call on changes.
   * @returns Function removing the listener.
   */
  subscribe: (listener: VoidFunction) => VoidFunction;
  /**
   * Opens the scanner and waits until it is closed.
   * @param options - additional options.
   * @returns `TimeoutError` if the scanner was not closed in time.
   * @example
   * await qrScanner.open({
   *   onCaptured(qr) {
   *     if (isValid(qr)) {
   *       qrScanner.close();
   *     }
   *   },
   * });
   */
  safeOpen: (options: QrScannerOpenOptions) => Promise<Result<TimeoutError, void>>;
  /**
   * Throwing version of `safeOpen`.
   * @throws {TimeoutError} The scanner was not closed in time.
   */
  open: (options: QrScannerOpenOptions) => Promise<void>;
  /**
   * Opens the scanner and waits until a QR code is captured or the scanner is closed.
   * @param options - additional options.
   * @returns Captured QR code content, or `undefined` if the scanner was closed without
   * capturing. `TimeoutError` if nothing was captured in time.
   * @example
   * const qr = await qrScanner.capture({ capture: qr => qr.startsWith('https://') });
   */
  safeCapture: (
    options?: QrScannerCaptureOptions,
  ) => Promise<Result<TimeoutError, string | undefined>>;
  /**
   * Throwing version of `safeCapture`.
   * @throws {TimeoutError} Nothing was captured in time.
   */
  capture: (options?: QrScannerCaptureOptions) => Promise<string | undefined>;
  /**
   * Closes the scanner.
   * @throws {NotInitializedError} The SDK is not initialized.
   * @throws {MethodUnsupportedError} The scanner is unsupported.
   */
  close: () => void;
}

/**
 * @internal
 */
export function createQrScanner(): QrScanner {
  const isOpened = createStore(false);

  const close = () => {
    requireMethod('web_app_close_scan_qr_popup').postEvent('web_app_close_scan_qr_popup');
    isOpened.set(false);
  };

  const safeOpen: QrScanner['safeOpen'] = async ({ text, onCaptured, timeout, signal }) => {
    const { postEvent } = requireMethod('web_app_open_scan_qr_popup');
    if (isOpened.get()) {
      throw new ConcurrentCallError('The QR scanner is already opened');
    }
    if (signal && signal.aborted) {
      throw signal.reason;
    }

    // Events are emitted asynchronously, so listeners can be added after the call.
    postEvent('web_app_open_scan_qr_popup', { text });
    isOpened.set(true);

    return new Promise((resolve, reject) => {
      const cleanups: VoidFunction[] = [];
      const settle = (fn: VoidFunction) => {
        cleanups.forEach(cleanup => cleanup());
        isOpened.set(false);
        fn();
      };
      const closeAndSettle = (fn: VoidFunction) => {
        // The scanner may be already closed by the user.
        isOpened.get() && getGlobals().postEvent('web_app_close_scan_qr_popup');
        settle(fn);
      };

      cleanups.push(
        onEvent('scan_qr_popup_closed', () => settle(() => resolve(ok(undefined)))),
        onEvent('qr_text_received', ({ data }) => onCaptured(data)),
        // The scanner was closed with the close method.
        isOpened.subscribe(() => {
          isOpened.get() || settle(() => resolve(ok(undefined)));
        }),
      );
      if (timeout) {
        const timeoutId = setTimeout(() => {
          closeAndSettle(() => resolve(err(new TimeoutError(timeout))));
        }, timeout);
        cleanups.push(() => clearTimeout(timeoutId));
      }
      if (signal) {
        const onAbort = () => {
          // Rejecting with the abort reason is the standard behavior of abortable APIs.
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          closeAndSettle(() => reject(signal.reason));
        };
        signal.addEventListener('abort', onAbort);
        cleanups.push(() => signal.removeEventListener('abort', onAbort));
      }
    });
  };

  const safeCapture: QrScanner['safeCapture'] = async (options = {}) => {
    const { capture = () => true, ...rest } = options;
    let captured: string | undefined;
    const result = await safeOpen({
      ...rest,
      onCaptured(qr) {
        if (captured === undefined && capture(qr)) {
          captured = qr;
          close();
        }
      },
    });
    return result.ok ? ok(captured) : result;
  };

  return {
    isSupported: () => isMethodSupported('web_app_open_scan_qr_popup'),
    isOpened: isOpened.get,
    subscribe: isOpened.subscribe,
    safeOpen,
    open: throwing(safeOpen),
    safeCapture,
    capture: throwing(safeCapture),
    close,
  };
}

/**
 * Native QR scanner.
 * @since Mini Apps v6.4
 */
export const qrScanner = /* @__PURE__ */ createQrScanner();
