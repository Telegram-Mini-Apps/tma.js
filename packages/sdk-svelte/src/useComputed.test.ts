import { get } from 'svelte/store';
import { describe, expect, it, vi } from 'vitest';

import { useComputed } from './useComputed.js';
import { createSource } from '../test/createSource.js';

describe('useComputed', () => {
  it('should notify subscribers about the value changes', () => {
    const source = createSource(0);
    const store = useComputed(source.computed);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    source.set(1);
    expect(listener.mock.calls).toEqual([[0], [1]]);
    unsubscribe();
  });

  it('should be subscribed to the computed value only while it has subscribers', () => {
    const source = createSource(0);
    const store = useComputed(source.computed);
    expect(source.listeners.size).toBe(0);
    source.set(1);
    expect(get(store)).toBe(1);
    const unsubscribe = store.subscribe(vi.fn());
    expect(source.listeners.size).toBe(1);
    unsubscribe();
    expect(source.listeners.size).toBe(0);
  });
});
