import { on } from '@/bridge/events/listening/on.js';
import { WithTrackableState } from '@/classes/WithTrackableState.js';
import type { PostEvent } from '@/bridge/methods/postEvent.js';
import type { RemoveEventListenerFn } from '@/events/types.js';
import type { ExecuteWithOptions } from '@/types/index.js';

import { requestViewport } from './requestViewport.js';
import type { ViewportProps, ViewportState } from './types.js';

/**
 * Formats value to make it stay in bounds [0, +Inf).
 * @param value - value to format.
 */
function truncate(value: number): number {
  return value < 0 ? 0 : value;
}

/**
 * @see Usage: https://docs.telegram-mini-apps.com/platform/viewport
 * @see API: https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/components/viewport
 */
export class Viewport extends WithTrackableState<ViewportState> {
  private readonly postEvent: PostEvent;

  constructor({ postEvent, stableHeight, height, width, isExpanded }: ViewportProps) {
    super({
      height: truncate(height),
      isExpanded,
      stableHeight: truncate(stableHeight),
      width: truncate(width),
    });
    this.postEvent = postEvent;
  }

  /**
   * Requests viewport information from the Telegram application and updates current Viewport
   * instance.
   * @param options - options to request fresh data.
   */
  async sync(options?: ExecuteWithOptions): Promise<void> {
    const { isStateStable, ...rest } = await requestViewport(options);
    this.set({
      ...rest,
      stableHeight: isStateStable ? rest.height : this.get('stableHeight'),
    });
  }

  /**
   * The current height of the **visible area** of the Mini App.
   *
   * The application can display just the top part of the Mini App, with its lower part remaining
   * outside the screen area. From this position, the user can "pull" the Mini App to its
   * maximum height, while the bot can do the same by calling `expand` method. As the position of
   * the Mini App changes, the current height value of the visible area will be updated  in real
   * time.
   *
   * Please note that the refresh rate of this value is not sufficient to smoothly follow the
   * lower border of the window. It should not be used to pin interface elements to the bottom
   * of the visible area. It's more appropriate to use the value of the `stableHeight`
   * field for this purpose.
   *
   * @see stableHeight
   */
  get height(): number {
    return this.get('height');
  }

  /**
   * The height of the visible area of the Mini App in its last stable state.
   *
   * The application can display just the top part of the Mini App, with its lower part remaining
   * outside the screen area. From this position, the user can "pull" the Mini App to its
   * maximum height, while the application can do the same by calling `expand` method.
   *
   * Unlike the value of `height`, the value of `stableHeight` does not change as the position
   * of the Mini App changes with user gestures or during animations. The value of `stableHeight`
   * will be updated after all gestures and animations are completed and
   * the Mini App reaches its final size.
   *
   * @see height
   */
  get stableHeight(): number {
    return this.get('stableHeight');
  }

  /**
   * Starts listening to viewport changes and applies them.
   * @returns Function to stop listening.
   */
  listen(): RemoveEventListenerFn {
    return on('viewport_changed', (event) => {
      const {
        height,
        width,
        is_expanded: isExpanded,
        is_state_stable: isStateStable,
      } = event;
      const truncatedHeight = truncate(height);

      this.set({
        height: truncatedHeight,
        isExpanded,
        width: truncate(width),
        ...(isStateStable ? { stableHeight: truncatedHeight } : {}),
      });
    });
  }

  /**
   * True if the Mini App is expanded to the maximum available height. Otherwise, if
   * the Mini App occupies part of the screen and can be expanded to the full height using
   * `expand` method.
   * @see expand
   */
  get isExpanded(): boolean {
    return this.get('isExpanded');
  }

  /**
   * Current visible area width.
   */
  get width(): number {
    return this.get('width');
  }

  /**
   * A method that expands the Mini App to the maximum available height. To find out if the Mini
   * App is expanded to the maximum height, refer to the value of the `isExpanded`.
   * @see isExpanded
   */
  expand(): void {
    this.postEvent('web_app_expand');
    this.set('isExpanded', true);
  }

  /**
   * True if the current viewport height is stable and is not going to change in the next moment.
   */
  get isStable(): boolean {
    return this.stableHeight === this.height;
  }
}
