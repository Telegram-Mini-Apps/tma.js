import { WithTrackableState } from '@/classes/WithTrackableState.js';
import type { PostEvent } from '@/bridge/methods/postEvent.js';
import type { ClosingBehaviorState } from '@/components/ClosingBehavior/types.js';

/**
 * @see Usage: https://docs.telegram-mini-apps.com/platform/closing-behavior
 * @see API: https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/components/closing-behavior
 */
export class ClosingBehavior extends WithTrackableState<ClosingBehaviorState> {
  constructor(isConfirmationNeeded: boolean, private readonly postEvent: PostEvent) {
    super({ isConfirmationNeeded });
  }

  private set isConfirmationNeeded(value: boolean) {
    this.set('isConfirmationNeeded', value);
    this.postEvent('web_app_setup_closing_behavior', { need_confirmation: value });
  }

  /**
   * True, if the confirmation dialog should be shown while the user is trying to close
   * the Mini App.
   */
  get isConfirmationNeeded(): boolean {
    return this.get('isConfirmationNeeded');
  }

  /**
   * Disables the confirmation dialog when closing the Mini App.
   */
  disableConfirmation(): void {
    this.isConfirmationNeeded = false;
  }

  /**
   * Enables the confirmation dialog when closing the Mini App.
   */
  enableConfirmation(): void {
    this.isConfirmationNeeded = true;
  }
}
