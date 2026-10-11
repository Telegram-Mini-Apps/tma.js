import { expect, it, vi } from 'vitest';

import { batch } from './batch.js';
import { computed } from './computed.js';
import { signal } from './signal.js';

it('should call subscriber only once if several signals were changed', () => {
  const a = signal(1);
  const b = signal(2);
  const c = computed(() => a() + b());

  const spy = vi.fn();
  c.sub(spy);

  batch(() => {
    a.set(10);
    a.set(11);
    b.set(30);
    b.set(88);
  });
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith(99, 3);

  spy.mockClear();
  a.set(1);
  a.set(2);
  b.set(3);
  b.set(4);
  expect(spy).toHaveBeenCalledTimes(4);
});

it('should work as expected if batch was called inside other batch', () => {
  const a = signal(1);
  const b = signal(2);
  const c = computed(() => a() + b());

  const spy = vi.fn();
  c.sub(spy);

  batch(() => {
    batch(() => {
      a.set(10);
      a.set(11);
    });
    batch(() => {
      b.set(30);
      b.set(88);
    });
  });
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith(99, 3);
});
