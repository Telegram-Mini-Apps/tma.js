import { on, off } from '@tma.js/bridge';
import { pipe } from 'fp-ts/function';

import { MiniApp, type MiniAppState } from '@/features/MiniApp/MiniApp.js';
import { themeParams } from '@/features/ThemeParams/instance.js';
import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withPostEvent } from '@/fn-options/withPostEvent.js';
import { withStateRestore } from '@/fn-options/withStateRestore.js';
import { withVersion } from '@/fn-options/withVersion.js';

export const miniApp = new MiniApp({
  ...pipe(
    sharedFeatureOptions(),
    withPostEvent,
    withVersion,
    withStateRestore<MiniAppState>('miniApp'),
  ),
  offVisibilityChanged(listener) {
    off('visibility_changed', listener);
  },
  onVisibilityChanged(listener) {
    on('visibility_changed', listener);
  },
  theme: themeParams.state,
});
