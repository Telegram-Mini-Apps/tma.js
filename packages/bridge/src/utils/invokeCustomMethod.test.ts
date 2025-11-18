import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { InvokeCustomMethodFailedError } from '@/errors.js';
import { request2Fp as _requestFp } from '@/utils/request2.js';

import { invokeCustomMethodFp } from './invokeCustomMethod.js';

const requestFp = vi.mocked(_requestFp);

vi.mock('@/utils/request2.js', () => ({ request2Fp: vi.fn() }));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('invokeCustomMethodFp', () => {
  it('should return error if requestFp returned it', async () => {
    requestFp.mockImplementationOnce(() => TE.left(new Error('test')));
    await pipe(
      invokeCustomMethodFp('getCurrentTime', {}, ''),
      TE.match(
        error => expect(error).toStrictEqual(new Error('test')),
        () => expect.unreachable(),
      ),
    )();
    expect.assertions(1);
  });

  it('should return error if response contained "error" prop', async () => {
    requestFp.mockImplementationOnce(() => TE.right({ error: 'UNAVAILABLE' }));
    await pipe(
      invokeCustomMethodFp('getCurrentTime', {}, ''),
      TE.match(
        error => expect(error).toStrictEqual(new InvokeCustomMethodFailedError('UNAVAILABLE')),
        () => expect.unreachable(),
      ),
    )();
    expect.assertions(1);
  });

  it('should return result using reponse\'s result property', async () => {
    requestFp.mockImplementationOnce(() => TE.right({ result: 123, req_id: '' }));
    await pipe(
      invokeCustomMethodFp('getCurrentTime', {}, ''),
      TE.match(
        () => expect.unreachable(),
        result => expect(result).toBe(123),
      ),
    )();
    expect.assertions(1);
  });
});
