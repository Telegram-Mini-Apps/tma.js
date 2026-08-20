import { describe, expect, it, vi } from 'vitest';

import { Stateful } from './Stateful.js';

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface State {
  safeAreaInsets: SafeAreaInsets;
  height: number;
  labels: string[];
}

function newStateful() {
  return new Stateful<State>({
    initialState: {
      safeAreaInsets: { top: 43, right: 0, bottom: 34, left: 0 },
      height: 800,
      labels: ['a', 'b'],
    },
    onChange: vi.fn(),
  });
}

describe('Stateful', () => {
  describe('getter (regression for #870)', () => {
    it('freezes nested-object reads so consumers cannot mutate them', () => {
      const s = newStateful();
      const insets = s.getter('safeAreaInsets');

      const first = insets();

      expect(Object.isFrozen(first)).toBe(true);
      expect(() => {
        first.top += 100;
      }).toThrow(TypeError);
    });

    it('reads never expose the internal state reference', () => {
      const s = newStateful();
      const insets = s.getter('safeAreaInsets');

      // Even if a caller bypasses the freeze via a proxy or type-cast,
      // the returned object is a copy, not the internal state.
      const returned = insets();
      // Force an update via the legitimate API and confirm the returned
      // value is not what the state now holds.
      s.setState({ safeAreaInsets: { top: 10, right: 0, bottom: 0, left: 0 } });
      // stale copy is unaffected
      expect(returned.top).toBe(43);
      // fresh read observes the update
      expect(insets().top).toBe(10);
    });

    it('freezes array reads too', () => {
      const s = newStateful();
      const labels = s.getter('labels');

      const first = labels();
      expect(Object.isFrozen(first)).toBe(true);
      expect(() => {
        first.push('mutated');
      }).toThrow(TypeError);
    });

    it('returns primitives unchanged', () => {
      const s = newStateful();
      const height = s.getter('height');

      expect(height()).toBe(800);
    });
  });
});
