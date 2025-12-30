import { retrieveLaunchParamsFp, on, off, type EventName, EventListener } from '@tma.js/bridge';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';

import { Viewport, type ViewportState } from '@/features/Viewport/Viewport.js';
import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withPostEvent } from '@/fn-options/withPostEvent.js';
import { withRequest } from '@/fn-options/withRequest.js';
import { withStateRestore } from '@/fn-options/withStateRestore.js';
import { withVersion } from '@/fn-options/withVersion.js';

function create() {
  const createListeners = <E extends EventName>(event: E) => {
    return {
      on: (listener: EventListener<E>) => {
        on(event, listener);
      },
      off: (listener: EventListener<E>) => {
        off(event, listener);
      },
    };
  };
  const viewportListeners = createListeners('viewport_changed');
  const fullscreenListeners = createListeners('fullscreen_changed');
  const safeAreaListeners = createListeners('safe_area_changed');
  const contentSafeAreaListeners = createListeners('content_safe_area_changed');

  return new Viewport({
    ...pipe(
      sharedFeatureOptions(),
      withStateRestore<ViewportState>('viewport'),
      withVersion,
      withPostEvent,
      withRequest,
    ),
    isFullscreen() {
      return pipe(retrieveLaunchParamsFp(), E.map(lp => !!lp.tgWebAppFullscreen));
    },
    isViewportStable() {
      return pipe(retrieveLaunchParamsFp(), E.map(lp => {
        return ['macos', 'tdesktop', 'unigram', 'webk', 'weba', 'web'].includes(lp.tgWebAppPlatform);
      }));
    },
    offContentSafeAreaInsetsChanged: contentSafeAreaListeners.off,
    offFullscreenChanged: fullscreenListeners.off,
    offSafeAreaInsetsChanged: safeAreaListeners.off,
    offViewportChanged: viewportListeners.off,
    onContentSafeAreaInsetsChanged: contentSafeAreaListeners.on,
    onFullscreenChanged: fullscreenListeners.on,
    onSafeAreaInsetsChanged: safeAreaListeners.on,
    onViewportChanged: viewportListeners.on,
  });
}

export const viewport = /* @__PURE__*/ create();
