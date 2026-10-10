import { setLogger } from '@tma.js/bridge';
import { describe, expect, it, vi } from 'vitest';

import { combineSubscribe, createObjectStore, createStore, shallowEqual } from './store.js';

describe('createStore', () => {
  it('should notify listeners only when the value changes', () => {
    const store = createStore(1);
    const listener = vi.fn();
    store.subscribe(listener);
    store.set(1);
    expect(listener).not.toHaveBeenCalled();
    store.set(2);
    expect(store.get()).toBe(2);
    expect(listener).toHaveBeenCalledOnce();
  });

  it('should stop notifying removed listeners', () => {
    const store = createStore(1);
    const listener = vi.fn();
    store.subscribe(listener)();
    store.set(2);
    expect(listener).not.toHaveBeenCalled();
  });

  it('should call other listeners if one throws', () => {
    const error = vi.fn();
    setLogger({ log: vi.fn(), warn: vi.fn(), error });
    const store = createStore(1);
    const listener = vi.fn();
    store.subscribe(() => {
      throw new Error('oops');
    });
    store.subscribe(listener);
    store.set(2);
    expect(listener).toHaveBeenCalledOnce();
    expect(error).toHaveBeenCalledOnce();
  });
});

describe('createObjectStore', () => {
  it('should keep the same object if properties did not change', () => {
    const store = createObjectStore({ a: 1, b: 2 });
    const value = store.get();
    store.update({ a: 1 });
    expect(store.get()).toBe(value);
    store.update({ a: 2 });
    expect(store.get()).toEqual({ a: 2, b: 2 });
  });
});

describe('shallowEqual', () => {
  it('should compare objects by their own keys and values', () => {
    expect(shallowEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(shallowEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(shallowEqual({ a: {} }, { a: {} })).toBe(false);
  });
});

describe('combineSubscribe', () => {
  it('should subscribe to all sources and unsubscribe from them', () => {
    const a = createStore(1);
    const b = createStore(1);
    const listener = vi.fn();
    const unsubscribe = combineSubscribe(a.subscribe, b.subscribe)(listener);
    a.set(2);
    b.set(2);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    a.set(3);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
