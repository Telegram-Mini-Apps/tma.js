import { on, off } from '@tma.js/bridge';
import { function as fn } from 'fp-ts';

import { ThemeParams, type ThemeParamsState } from '@/features/ThemeParams/ThemeParams.js';
import { sharedFeatureOptions } from '@/fn-options/sharedFeatureOptions.js';
import { withStateRestore } from '@/fn-options/withStateRestore.js';
import { themeParams as globalThemeParams } from '@/globals/themeParams.js';

function instantiate() {
  return new ThemeParams({
    ...fn.pipe(
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
}

export const themeParams = /* @__PURE__*/ instantiate();
