import type {
  ClosingBehaviorEvents,
  ClosingBehaviorState,
} from './types.js';
import type { PostEvent } from '../../bridge/methods/postEvent.js';
import { postEvent as defaultPostEvent } from '../../bridge/methods/postEvent.js';
import { EventEmitter } from '../../event-emitter/EventEmitter.js';
import { State } from '../../state/State.js';

type Emitter = EventEmitter<ClosingBehaviorEvents>;

/**
 * Component responsible for controlling current closing confirmation
 * status.
 */
export class ClosingBehavior {
  private readonly ee = new EventEmitter<ClosingBehaviorEvents>();

  private readonly state: State<ClosingBehaviorState>;

  constructor(
    isConfirmationNeeded: boolean,
    private readonly postEvent: PostEvent = defaultPostEvent,
  ) {
    this.state = new State({ isConfirmationNeeded }, this.ee);
  }

  private set isConfirmationNeeded(value: boolean) {
    this.state.set('isConfirmationNeeded', value);
    this.postEvent('web_app_setup_closing_behavior', { need_confirmation: value });
  }

  /**
   * Returns true, if the confirmation dialog enabled while the user is trying
   * to close the Mini App.
   */
  get isConfirmationNeeded(): boolean {
    return this.state.get('isConfirmationNeeded');
  }

  /**
   * Disables the confirmation dialog while the user is trying to close the
   * Mini App.
   */
  disableConfirmation(): void {
    this.isConfirmationNeeded = false;
  }

  /**
   * Enables the confirmation dialog while the user is trying to close the
   * Mini App.
   */
  enableConfirmation(): void {
    this.isConfirmationNeeded = true;
  }

  /**
   * Adds new event listener.
   */
  on: Emitter['on'] = this.ee.on.bind(this.ee);

  /**
   * Removes event listener.
   */
  off: Emitter['off'] = this.ee.off.bind(this.ee);
}
