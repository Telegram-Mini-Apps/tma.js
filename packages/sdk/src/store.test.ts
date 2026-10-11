import { setLogger } from '@tma.js/bridge';
import { describe, expect, it, vi } from 'vitest';

import {
  combineSubscribe,
  computed,
  createObjectStore,
  createStore,
  computedFromStore,
  computedPick,
  shallowEqual,
} from './store.js';

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

describe('computed', () => {
  it('should return the current value', () => {
    const store = createStore(1);
    const double = computed(() => store.get() * 2, store.subscribe);
    expect(double()).toBe(2);
    store.set(2);
    expect(double()).toBe(4);
  });

  it('should call listeners with the next and the previous values only if the value changes', () => {
    const store = createObjectStore({ a: 1, b: 1 });
    const a = computedPick(store, 'a');
    const listener = vi.fn();
    a.subscribe(listener);
    store.update({ b: 2 });
    expect(listener).not.toHaveBeenCalled();
    store.update({ a: 2 });
    store.update({ a: 3 });
    expect(listener.mock.calls).toEqual([[2, 1], [3, 2]]);
  });

  it('should depend on all the sources', () => {
    const a = createStore(1);
    const b = createStore(1);
    const sum = computed(() => a.get() + b.get(), a.subscribe, b.subscribe);
    const listener = vi.fn();
    sum.subscribe(listener);
    a.set(2);
    b.set(2);
    expect(listener.mock.calls).toEqual([[3, 2], [4, 3]]);
  });

  it('should be subscribed to the sources only while it has listeners', () => {
    const store = createStore(1);
    const subscribe = vi.fn(store.subscribe);
    const value = computed(store.get, subscribe);
    const unsubscribeA = value.subscribe(vi.fn());
    const unsubscribeB = value.subscribe(vi.fn());
    expect(subscribe).toHaveBeenCalledOnce();
    unsubscribeA();
    unsubscribeA();
    const listener = vi.fn();
    value.subscribe(listener);
    unsubscribeB();
    store.set(2);
    expect(listener).toHaveBeenCalledExactlyOnceWith(2, 1);
  });

  it('should compute the previous value from the moment of the first subscription', () => {
    const store = createStore(1);
    const value = computedFromStore(store);
    value.subscribe(vi.fn())();
    store.set(2);
    const listener = vi.fn();
    value.subscribe(listener);
    store.set(3);
    expect(listener).toHaveBeenCalledExactlyOnceWith(3, 2);
  });

  it('should create independent subscriptions for the same listener', () => {
    const store = createStore(1);
    const value = computedFromStore(store);
    const listener = vi.fn();
    const unsubscribe = value.subscribe(listener);
    value.subscribe(listener);
    unsubscribe();
    store.set(2);
    expect(listener).toHaveBeenCalledOnce();
  });
});
