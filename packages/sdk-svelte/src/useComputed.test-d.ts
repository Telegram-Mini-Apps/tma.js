import { mainButton, type MainButtonState } from '@tma.js/sdk';
import type { Readable } from 'svelte/store';
import { describe, expectTypeOf, it } from 'vitest';

import { useComputed } from './useComputed.js';

describe('useComputed', () => {
  it('should return a store with the computed value', () => {
    expectTypeOf(useComputed(mainButton.state)).toEqualTypeOf<Readable<MainButtonState>>();
    expectTypeOf(useComputed(mainButton.isVisible)).toEqualTypeOf<Readable<boolean>>();
  });

  it('should require a computed value', () => {
    // @ts-expect-error A plain function has no subscribe method.
    useComputed(() => true);
  });
});
