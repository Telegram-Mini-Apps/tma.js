import { off } from '@/bridge/events/listening/off.js';
import { on } from '@/bridge/events/listening/on.js';
import { WithStateUtils } from '@/classes/WithStateUtils.js';
import type { PostEvent } from '@/bridge/methods/postEvent.js';
import type { RGB } from '@/colors/types.js';
import type {
  MainButtonEvents,
  MainButtonParams,
  MainButtonProps,
  MainButtonState,
} from '@/components/MainButton/types.js';
import type { EventEmitter } from '@/events/event-emitter/EventEmitter.js';

type Emitter = EventEmitter<MainButtonEvents>;

/**
 * @see Usage: https://docs.telegram-mini-apps.com/platform/main-button
 * @see API: https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/components/main-button
 */
export class MainButton extends WithStateUtils<MainButtonState> {
  private readonly postEvent: PostEvent;

  constructor({ postEvent, ...rest }: MainButtonProps) {
    super(rest);
    this.postEvent = postEvent;
  }

  /**
   * The MainButton background color.
   */
  get bgColor(): RGB {
    return this.get('bgColor');
  }

  /**
   * Sends current local state to the Telegram application.
   */
  private commit(): void {
    // We should not commit changes until payload is correct. We could
    // have some invalid values in case, button instance was created
    // with empty values. Otherwise, an unexpected behavior could be received.
    if (this.text === '') {
      return;
    }

    this.postEvent('web_app_setup_main_button', {
      is_visible: this.isVisible,
      is_active: this.isEnabled,
      is_progress_visible: this.isLoaderVisible,
      text: this.text,
      color: this.bgColor,
      text_color: this.textColor,
    });
  }

  /**
   * Disables the MainButton.
   * @see Does not work on Android: https://github.com/Telegram-Mini-Apps/issues/issues/1
   */
  disable(): this {
    this.isEnabled = false;
    return this;
  }

  /**
   * Enables the MainButton.
   */
  enable(): this {
    this.isEnabled = true;
    return this;
  }

  /**
   * Hides the MainButton.
   */
  hide(): this {
    this.isVisible = false;
    return this;
  }

  /**
   * Hides the MainButton loading indicator.
   */
  hideLoader(): this {
    this.isLoaderVisible = false;
    return this;
  }

  private set isEnabled(isEnabled: boolean) {
    this.setParams({ isEnabled });
  }

  /**
   * True if the MainButton is enabled.
   */
  get isEnabled(): boolean {
    return this.get('isEnabled');
  }

  private set isLoaderVisible(isLoaderVisible: boolean) {
    this.setParams({ isLoaderVisible });
  }

  /**
   * True if the MainButton loader is visible.
   */
  get isLoaderVisible(): boolean {
    return this.get('isLoaderVisible');
  }

  private set isVisible(isVisible: boolean) {
    this.setParams({ isVisible });
  }

  /**
   * True if the MainButton is visible.
   */
  get isVisible(): boolean {
    return this.get('isVisible');
  }

  /**
   * Adds a new event listener.
   * @param event - event to listen.
   * @param listener - listener to add.
   */
  on: Emitter['on'] = (event, listener) => (
    event === 'click'
      ? on('main_button_pressed', listener)
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
      ? off('main_button_pressed', listener)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      : this.state.off(event, listener as any)
  );

  /**
   * Shows the MainButton.
   *
   * Note that opening the Mini App from the attachment menu hides the main button until the
   * user interacts with the Mini App interface.
   */
  show(): this {
    this.isVisible = true;
    return this;
  }

  /**
   * Shows a loading indicator on the Main Button.
   */
  showLoader(): this {
    this.isLoaderVisible = true;
    return this;
  }

  /**
   * Sets a new MainButton text. Minimal length for the text is 1 symbol, and maximum is 64 symbols.
   * @param text - a new text.
   */
  setText(text: string): this {
    return this.setParams({ text });
  }

  /**
   * Sets a new Main Button text color.
   * @param textColor - new text color.
   */
  setTextColor(textColor: RGB): this {
    return this.setParams({ textColor });
  }

  /**
   * Updates current Main Button color.
   * @param bgColor - color to set.
   */
  setBgColor(bgColor: RGB): this {
    return this.setParams({ bgColor });
  }

  /**
   * Allows setting multiple Main Button parameters.
   * @param params - Main Button parameters.
   */
  setParams(params: Partial<MainButtonParams>): this {
    this.set(params);
    this.commit();
    return this;
  }

  /**
   * The MainButton text.
   */
  get text(): string {
    return this.get('text');
  }

  /**
   * The MainButton text color.
   */
  get textColor(): RGB {
    return this.get('textColor');
  }
}
