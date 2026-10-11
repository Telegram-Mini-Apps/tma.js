import { describe, expect, it } from 'vitest';
import { effectScope, isReadonly } from 'vue';

import { useComputed } from './useComputed.js';
import { createSource } from '../test/createSource.js';

describe('useComputed', () => {
  it('should update the ref with the value', () => {
    const source = createSource(0);
    const value = useComputed(source.computed);
    expect(value.value).toBe(0);
    source.set(1);
    expect(value.value).toBe(1);
    expect(isReadonly(value)).toBe(true);
  });

  it('should keep objects identity', () => {
    const object = {};
    const value = useComputed(createSource(object).computed);
    expect(value.value).toBe(object);
  });

  it('should unsubscribe when the effect scope is disposed', () => {
    const source = createSource(0);
    const scope = effectScope();
    scope.run(() => useComputed(source.computed));
    expect(source.listeners.size).toBe(1);
    scope.stop();
    expect(source.listeners.size).toBe(0);
  });
});
