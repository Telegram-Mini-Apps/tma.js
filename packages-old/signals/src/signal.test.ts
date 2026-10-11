import { afterEach, describe, expect, it, vi } from 'vitest';

import { signal } from './signal.js';

afterEach(() => {
  vi.clearAllMocks();
});

describe('get', () => {
  it('should return signal value', () => {
    const s = signal(123321);
    expect(s()).toBe(123321);
  });
});

describe('set', () => {
  it('should update signal value', () => {
    const s = signal(1);
    expect(s()).toBe(1);
    s.set(2);
    expect(s()).toBe(2);
  });
});

describe('sub', () => {
  it('should call passed function if signal was changed', () => {
    const s = signal(100);
    const fn = vi.fn();
    s.sub(fn);
    s.set(200);
    expect(fn).toBeCalledTimes(1);
    expect(fn).toBeCalledWith(200, 100);
  });

  it('should not call function if set value is the same', () => {
    const s = signal(1);
    const fn = vi.fn();
    s.sub(fn);
    s.set(1);
    expect(fn).toBeCalledTimes(0);
  });

  it('should call listener only once if option is passed', () => {
    const s = signal(1);
    const fn = vi.fn();
    s.sub(fn, { once: true });
    s.set(2);
    s.set(3);
    expect(fn).toBeCalledTimes(1);
  });
});

describe('reset', () => {
  it('should set signal value to initially passed', () => {
    const obj = {};
    const s = signal(obj);
    s.set({ a: 1 });
    expect(s()).not.toBe(obj);
    s.reset();
    expect(s()).toBe(obj);
  });
});

describe('unsub', () => {
  it('should not call passed function if signal was changed', () => {
    const s = signal(100);
    const fn = vi.fn();
    s.sub(fn);
    s.set(200);
    expect(fn).toBeCalledTimes(1);
    expect(fn).toBeCalledWith(200, 100);
    fn.mockClear();

    s.unsub(fn);
    s.set(300);
    expect(fn).toBeCalledTimes(0);
  });

  it('should remove listener only if its "once" is the same', () => {
    const s = signal(1);
    const fn = vi.fn();
    const fn2 = vi.fn();
    s.sub(fn);
    s.sub(fn2, { once: true });

    s.unsub(fn, true);
    s.unsub(fn2);

    expect(fn).toHaveBeenCalledTimes(0);
    expect(fn2).toHaveBeenCalledTimes(0);
    s.set(2);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
    fn.mockClear();
    fn2.mockClear();

    s.unsub(fn);
    s.unsub(fn2, true);
    s.set(3);
    expect(fn).toHaveBeenCalledTimes(0);
    expect(fn2).toHaveBeenCalledTimes(0);
  });
});

describe('destroy', () => {
  it('should remove only all listeners', () => {
    const s = signal(1);
    const fn = vi.fn();
    const fn2 = vi.fn();
    s.sub(fn);
    s.sub(fn2);
    s.set(2);
    expect(fn).toBeCalledTimes(1);
    expect(fn2).toBeCalledTimes(1);
    fn.mockClear();
    fn2.mockClear();

    s.destroy();
    s.set(3);
    expect(fn).toBeCalledTimes(0);
    expect(fn2).toBeCalledTimes(0);
  });
});
