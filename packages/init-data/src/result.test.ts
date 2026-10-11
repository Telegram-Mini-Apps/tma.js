import { describe, expect, it } from 'vitest';

import { err, ok, type Result, throwing, unwrap } from './result.js';

describe('unwrap', () => {
  it('should return the data of a successful result', () => {
    expect(unwrap(ok(1))).toBe(1);
  });

  it('should throw the error of a failed result', () => {
    const error = new Error('Failed');
    expect(() => unwrap(err(error))).toThrow(error);
  });
});

describe('throwing', () => {
  const error = new Error('Failed');

  function safeDivide(a: number, b: number): Result<Error, number> {
    return b ? ok(a / b) : err(error);
  }

  async function safeDivideAsync(a: number, b: number): Promise<Result<Error, number>> {
    return safeDivide(a, b);
  }

  it('should pass the arguments and return the data', () => {
    expect(throwing(safeDivide)(6, 3)).toBe(2);
  });

  it('should throw the error', () => {
    expect(() => throwing(safeDivide)(6, 0)).toThrow(error);
  });

  it('should resolve with the data of an async function', async () => {
    await expect(throwing(safeDivideAsync)(6, 3)).resolves.toBe(2);
  });

  it('should reject with the error of an async function', async () => {
    await expect(throwing(safeDivideAsync)(6, 0)).rejects.toBe(error);
  });
});
