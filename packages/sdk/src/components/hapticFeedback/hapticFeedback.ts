import type { ImpactHapticFeedbackStyle, NotificationHapticFeedbackType } from '@tma.js/bridge';

import { isMethodSupported, requireMethod } from '../../globals.js';

/**
 * All methods throw:
 * - `NotInitializedError` if the SDK is not initialized;
 * - `MethodUnsupportedError` if haptic feedback is unsupported.
 * @since Mini Apps v6.1
 */
export interface HapticFeedback {
  /**
   * Notifies that an impact occurred.
   * @param style - impact style.
   */
  impactOccurred: (style: ImpactHapticFeedbackStyle) => void;
  /**
   * @returns True if the SDK is initialized and haptic feedback is supported.
   */
  isSupported: () => boolean;
  /**
   * Notifies that a task or action succeeded, failed, or produced a warning.
   * @param type - notification type.
   */
  notificationOccurred: (type: NotificationHapticFeedbackType) => void;
  /**
   * Notifies that the user changed a selection. Don't use it when making or confirming
   * a selection, use it only when the selection changes.
   */
  selectionChanged: () => void;
}

const METHOD = 'web_app_trigger_haptic_feedback';

/**
 * Haptic feedback, i.e. device vibrations.
 * @since Mini Apps v6.1
 */
export const hapticFeedback: HapticFeedback = {
  impactOccurred(style) {
    requireMethod(METHOD).postEvent(METHOD, { impact_style: style, type: 'impact' });
  },
  isSupported: () => isMethodSupported(METHOD),
  notificationOccurred(type) {
    requireMethod(METHOD).postEvent(METHOD, { notification_type: type, type: 'notification' });
  },
  selectionChanged() {
    requireMethod(METHOD).postEvent(METHOD, { type: 'selection_change' });
  },
};
