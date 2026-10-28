import { type DeepReadonly, mainButton, type MainButtonState } from '@tma.js/sdk';
import { describe, expectTypeOf, it } from 'vitest';
import type { Ref } from 'vue';

import { useComputed } from './useComputed.js';

describe('useComputed', () => {
  it('should return a ref to the computed value', () => {
    expectTypeOf(useComputed(mainButton.state))
      .toEqualTypeOf<Readonly<Ref<DeepReadonly<MainButtonState>>>>();
    expectTypeOf(useComputed(mainButton.isVisible)).toEqualTypeOf<Readonly<Ref<boolean>>>();
  });

  it('should require a computed value', () => {
    // @ts-expect-error A plain function has no subscribe method.
    useComputed(() => true);
  });
});
