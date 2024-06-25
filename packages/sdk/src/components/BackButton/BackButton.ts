import { off } from '@/bridge/events/listening/off.js';
import { on } from '@/bridge/events/listening/on.js';
import { WithSupportsAndStateUtils } from '@/classes/WithSupportsAndStateUtils.js';
import type { PostEvent } from '@/bridge/methods/postEvent.js';
import type { BackButtonEvents, BackButtonState } from '@/components/BackButton/types.js';
import type { EventEmitter } from '@/events/event-emitter/EventEmitter.js';
import type { Version } from '@/version/types.js';

type Emitter = EventEmitter<BackButtonEvents>;

/**
 * @see Usage: https://docs.telegram-mini-apps.com/platform/back-button
 * @see API: https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/components/back-button
 */
export class BackButton extends WithSupportsAndStateUtils<BackButtonState, 'show' | 'hide'> {
  constructor(isVisible: boolean, version: Version, private readonly postEvent: PostEvent) {
    super({ isVisible }, version, {
      show: 'web_app_setup_back_button',
      hide: 'web_app_setup_back_button',
    });
  }

  private set isVisible(visible: boolean) {
    this.set('isVisible', visible);
    this.postEvent('web_app_setup_back_button', { is_visible: visible });
  }

  /**
   * True if BackButton is currently visible.
   */
  get isVisible(): boolean {
    return this.get('isVisible');
  }

  /**
   * Hides the BackButton.
   */
  hide(): void {
    this.isVisible = false;
  }

  /**
   * Adds a new event listener.
   * @param event - event to listen.
   * @param listener - listener to add.
   */
  on: Emitter['on'] = (event, listener) => (
    event === 'click'
      ? on('back_button_pressed', listener)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      : this.state.on(event, listener as any)
  );

  /**
   * Removes the event listener.
   * @param event - event to listen.
   * @param listener - listener to remove.
   */
  off: Emitter['off'] = (event, listener) => (
    event === 'click'
      ? off('back_button_pressed', listener)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      : this.state.off(event, listener as any)
  );

  /**
   * Shows the BackButton.
   */
  show(): void {
    this.isVisible = true;
  }
}
