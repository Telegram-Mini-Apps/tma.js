import type {
  ImpactHapticFeedbackStyle,
  NotificationHapticFeedbackType,
  PostEventError,
} from '@tma.js/bridge';
import type { Computed } from '@tma.js/signals';
import * as E from 'fp-ts/Either';

import type { SharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import type { WithPostEvent } from '@/fn-options/withPostEvent.js';
import type { WithVersion } from '@/fn-options/withVersion.js';
import { createIsSupportedSignal } from '@/helpers/createIsSupportedSignal.js';
import { throwifyWithChecksFp } from '@/with-checks/throwifyWithChecksFp.js';
import { createWithChecksFp, type WithChecksFp, type WithChecks } from '@/with-checks/withChecksFp.js';

type HapticFeedbackEither = E.Either<PostEventError, void>;

export interface HapticFeedbackOptions extends WithVersion, WithPostEvent, SharedFeatureOptions {
}

/**
 * @since Mini Apps v6.1
 */
export class HapticFeedback {
  constructor({ postEvent, isTma, version }: HapticFeedbackOptions) {
    const HAPTIC_METHOD_NAME = 'web_app_trigger_haptic_feedback';
    const wrapSupported = createWithChecksFp({
      requires: HAPTIC_METHOD_NAME,
      isTma,
      version,
      returns: 'plain',
    });

    this.isSupported = createIsSupportedSignal(HAPTIC_METHOD_NAME, version);
    this.impactOccurredFp = wrapSupported(style => {
      return postEvent(HAPTIC_METHOD_NAME, { type: 'impact', impact_style: style });
    });
    this.notificationOccurredFp = wrapSupported(type => {
      return postEvent(HAPTIC_METHOD_NAME, { type: 'notification', notification_type: type });
    });
    this.selectionChangedFp = wrapSupported(() => {
      return postEvent(HAPTIC_METHOD_NAME, { type: 'selection_change' });
    });

    this.impactOccurred = throwifyWithChecksFp(this.impactOccurredFp);
    this.notificationOccurred = throwifyWithChecksFp(this.notificationOccurredFp);
    this.selectionChanged = throwifyWithChecksFp(this.selectionChangedFp);
  }

  /**
   * Signal indicating if the component is supported.
   */
  readonly isSupported: Computed<boolean>;

  /**
   * A method that tells if an impact occurred. The Telegram app may play the
   * appropriate haptics based on style value passed.
   * @param style - impact style.
   * @since Mini Apps v6.1
   */
  impactOccurredFp: WithChecksFp<(style: ImpactHapticFeedbackStyle) => HapticFeedbackEither, true>;

  /**
   * @see impactOccurredFp
   */
  impactOccurred: WithChecks<(style: ImpactHapticFeedbackStyle) => void, true>;

  /**
   * A method tells that a task or action has succeeded, failed, or produced
   * a warning. The Telegram app may play the appropriate haptics based on type
   * value passed.
   * @param type - notification type.
   * @since Mini Apps v6.1
   */
  notificationOccurredFp: WithChecksFp<
    (type: NotificationHapticFeedbackType) => HapticFeedbackEither,
    true
  >;

  /**
   * @see notificationOccurredFp
   */
  notificationOccurred: WithChecks<(type: NotificationHapticFeedbackType) => void, true>;

  /**
   * A method tells that the user has changed a selection. The Telegram app may
   * play the appropriate haptics.
   *
   * Do not use this feedback when the user makes or confirms a selection; use
   * it only when the selection changes.
   * @since Mini Apps v6.1
   */
  selectionChangedFp: WithChecksFp<() => HapticFeedbackEither, true>;

  /**
   * @see selectionChangedFp
   */
  selectionChanged: WithChecks<() => void, true>;
}
