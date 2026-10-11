import { afterEach, describe, expect, it, vi } from 'vitest';

import { setCssVar, deleteCssVar } from './css-vars.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('setCssVar', () => {
  it('should call document.documentElement.style.setProperty with passed "name" and "value" arguments', () => {
    const spy = vi.spyOn(document.documentElement.style, 'setProperty').mockImplementation(() => {
    });

    setCssVar('tma', 'is cool');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith('tma', 'is cool');
  });
});

describe('deleteCssVar', () => {
  it('should call document.documentElement.style.removeProperty with passed "name" argument', () => {
    const spy = vi
      .spyOn(document.documentElement.style, 'removeProperty')
      .mockImplementation(() => '');

    deleteCssVar('tma');
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith('tma');
  });
});
