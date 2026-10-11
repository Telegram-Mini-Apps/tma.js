import { mainButton, type MainButtonState } from '@tma.js/sdk';
import { describe, expectTypeOf, it } from 'vitest';

import { useComputed } from './useComputed.js';

describe('useComputed', () => {
  it('should return the computed value', () => {
    expectTypeOf(useComputed(mainButton.state)).toEqualTypeOf<MainButtonState>();
    expectTypeOf(useComputed(mainButton.isVisible)).toEqualTypeOf<boolean>();
  });

  it('should require a computed value', () => {
    // @ts-expect-error A plain function has no subscribe method.
    useComputed(() => true);
  });
});
