import { isMethodSupported, requireMethod } from '../../globals.js';
import { withIsSupported } from '../../is-supported.js';

/**
 * Hides the on-screen keyboard, if it is visible.
 * @throws {NotInitializedError} The SDK is not initialized.
 * @throws {MethodUnsupportedError} The method is unsupported.
 * @since Mini Apps v9.1
 */
export const hideKeyboard = /* @__PURE__ */ withIsSupported(
  function(): void {
    requireMethod('web_app_hide_keyboard').postEvent('web_app_hide_keyboard');
  },
  () => isMethodSupported('web_app_hide_keyboard'),
);
