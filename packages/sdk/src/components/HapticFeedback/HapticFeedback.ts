import { WithSupports } from '@/classes/WithSupports.js';
import type { PostEvent } from '@/bridge/methods/postEvent.js';
import type {
  ImpactHapticFeedbackStyle,
  NotificationHapticFeedbackType,
} from '@/bridge/methods/types/haptic.js';
import type { Version } from '@/version/types.js';

/**
 * @see Usage: https://docs.telegram-mini-apps.com/platform/haptic-feedback
 * @see API: https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/components/haptic-feedback
 */
export class HapticFeedback
  extends WithSupports<'impactOccurred' | 'notificationOccurred' | 'selectionChanged'> {
  constructor(version: Version, private readonly postEvent: PostEvent) {
    super(version, {
      impactOccurred: 'web_app_trigger_haptic_feedback',
      notificationOccurred: 'web_app_trigger_haptic_feedback',
      selectionChanged: 'web_app_trigger_haptic_feedback',
    });
  }

  /**
   * A method tells that an impact occurred. The Telegram app may play the
   * appropriate haptics based on style value passed.
   * @param style - impact style.
   */
  impactOccurred(style: ImpactHapticFeedbackStyle): void {
    this.postEvent('web_app_trigger_haptic_feedback', {
      type: 'impact',
      impact_style: style,
    });
  }

  /**
   * A method tells that a task or action has succeeded, failed, or produced
   * a warning. The Telegram app may play the appropriate haptics based on
   * type value passed.
   * @param type - notification type.
   */
  notificationOccurred(type: NotificationHapticFeedbackType): void {
    this.postEvent('web_app_trigger_haptic_feedback', {
      type: 'notification',
      notification_type: type,
    });
  }

  /**
   * A method tells that the user has changed a selection. The Telegram app
   * may play the appropriate haptics.
   *
   * Do not use this feedback when the user makes or confirms a selection;
   * use it only when the selection changes.
   */
  selectionChanged(): void {
    this.postEvent('web_app_trigger_haptic_feedback', { type: 'selection_change' });
  }
}
