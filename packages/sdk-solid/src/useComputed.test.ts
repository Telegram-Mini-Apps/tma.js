import { createRoot } from 'solid-js';
import { describe, expect, it } from 'vitest';

import { useComputed } from './useComputed.js';
import { createSource } from '../test/createSource.js';

describe('useComputed', () => {
  it('should update the accessor with the value', () => {
    const source = createSource(0);
    const value = useComputed(source.computed);
    expect(value()).toBe(0);
    source.set(1);
    expect(value()).toBe(1);
  });

  it('should keep function values as is', () => {
    const fnA = () => 'a';
    const fnB = () => 'b';
    const source = createSource(fnA);
    const value = useComputed(source.computed);
    expect(value()).toBe(fnA);
    source.set(fnB);
    expect(value()).toBe(fnB);
  });

  it('should unsubscribe when the owner is disposed', () => {
    const source = createSource(0);
    createRoot(dispose => {
      useComputed(source.computed);
      expect(source.listeners.size).toBe(1);
      dispose();
    });
    expect(source.listeners.size).toBe(0);
  });
});
