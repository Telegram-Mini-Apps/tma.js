import { on, off } from '@tma.js/bridge';
import { pipe } from 'fp-ts/function';

import { ThemeParams, type ThemeParamsState } from '@/features/ThemeParams/ThemeParams.js';
import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withStateRestore } from '@/fn-options/withStateRestore.js';
import { themeParams as globalThemeParams } from '@/globals/themeParams.js';

export const themeParams = new ThemeParams({
  ...pipe(
    sharedFeatureOptions(),
    withStateRestore<ThemeParamsState>('themeParams'),
  ),
  offChange(listener) {
    off('theme_changed', listener);
  },
  onChange(listener) {
    on('theme_changed', listener);
  },
  initialState: globalThemeParams,
});
