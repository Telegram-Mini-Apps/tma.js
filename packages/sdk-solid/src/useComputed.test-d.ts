import { type DeepReadonly, mainButton, type MainButtonState } from '@tma.js/sdk';
import type { Accessor } from 'solid-js';
import { describe, expectTypeOf, it } from 'vitest';

import { useComputed } from './useComputed.js';

describe('useComputed', () => {
  it('should return an accessor to the computed value', () => {
    expectTypeOf(useComputed(mainButton.state))
      .toEqualTypeOf<Accessor<DeepReadonly<MainButtonState>>>();
    expectTypeOf(useComputed(mainButton.isVisible)).toEqualTypeOf<Accessor<boolean>>();
  });

  it('should require a computed value', () => {
    // @ts-expect-error A plain function has no subscribe method.
    useComputed(() => true);
  });
});
