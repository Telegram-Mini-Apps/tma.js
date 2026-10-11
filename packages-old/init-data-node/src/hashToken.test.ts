import { expect, it, vi } from 'vitest';

import { hashToken } from './hashToken';

it('should call the second argument with the first argument and string "WebAppData"', () => {
  const spy = vi.fn();
  hashToken('abc', spy);
  expect(spy).toHaveBeenCalledOnce();
  expect(spy).toHaveBeenCalledWith('abc', 'WebAppData');
});
