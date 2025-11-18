import { TimeoutError } from 'better-promises';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import {
  createWindow,
  mockSessionStorageGetItem,
  mockSessionStorageSetItem,
  mockWindow,
} from 'test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UnknownEnvError } from '@/errors.js';
import { request2Fp as _requestFp } from '@/utils/request2.js';

import { isTMA, isTMAFp } from './isTMA.js';

const requestFp = vi.mocked(_requestFp);

vi.mock('@/utils/request2.js', () => ({ request2Fp: vi.fn() }));

beforeEach(() => {
  vi.restoreAllMocks();

  // Every isTMA call may set a value in the session storage.
  mockSessionStorageSetItem();
  mockSessionStorageGetItem();
});

describe('isTMA', () => {
  describe('complete', () => {
    it('should return true if current window contains TelegramWebviewProxy property', async () => {
      createWindow({ TelegramWebviewProxy: { postEvent: () => undefined } } as any);
      await expect(isTMA('complete')).resolves.toBe(true);
    });

    it(
      'should return promise with true value resolved, if requesting theme parameters was successful',
      async () => {
        createWindow();
        requestFp.mockImplementationOnce(() => TE.right({}));
        await expect(isTMA('complete')).resolves.toBe(true);
      },
    );

    it(
      'should return promise with false value resolved if promise was rejected with timeout error',
      async () => {
        createWindow();
        requestFp.mockImplementationOnce(() => TE.left(new TimeoutError(100)));
        await expect(isTMA('complete')).resolves.toBe(false);

        requestFp.mockImplementationOnce(() => TE.left(new Error('something else')));
        await expect(isTMA('complete')).rejects.toStrictEqual(new Error('something else'));
      },
    );
  });

  describe('sync', () => {
    beforeEach(() => {
      mockWindow({ location: { href: '' } } as any);
    });

    it('should return true if env contains launch params', () => {
      vi
        .spyOn(window.location, 'href', 'get')
        .mockImplementation(() => {
          return '/abc?tgWebAppStartParam=START#tgWebAppPlatform=tdesktop&tgWebAppVersion=7.0&tgWebAppThemeParams=%7B%7D';
        });
      expect(isTMA()).toBe(true);
    });

    it('should return true if env doesnt contain launch params', () => {
      expect(isTMA()).toBe(false);
    });
  });
});

describe('isTMAFp', () => {
  describe('complete', () => {
    it('should return true if current window contains TelegramWebviewProxy property', async () => {
      createWindow({ TelegramWebviewProxy: { postEvent: () => undefined } } as any);
      await pipe(
        isTMAFp('complete'),
        TE.match(
          () => expect.unreachable(),
          result => expect(result).toBe(true),
        ),
      )();
      expect.assertions(1);
    });

    it(
      'should return promise with true value resolved, if requesting theme parameters was successful',
      async () => {
        createWindow();
        requestFp.mockImplementationOnce(() => TE.right({}));
        await pipe(
          isTMAFp('complete'),
          TE.match(
            () => expect.unreachable(),
            result => expect(result).toBe(true),
          ),
        )();
        expect.assertions(1);
      },
    );

    it(
      'should return promise with false value resolved if promise was rejected with timeout error',
      async () => {
        createWindow();
        requestFp.mockImplementationOnce(() => TE.left(new TimeoutError(100)));
        await pipe(
          isTMAFp('complete'),
          TE.match(
            () => expect.unreachable(),
            result => expect(result).toBe(false),
          ),
        )();
        expect.assertions(1);

        requestFp.mockImplementationOnce(() => TE.left(new Error('something else')));
        await pipe(
          isTMAFp('complete'),
          TE.match(
            error => expect(error).toStrictEqual(new Error('something else')),
            () => expect.unreachable(),
          ),
        )();
        expect.assertions(2);
      },
    );

    it('should return false if the env is unknown', async () => {
      mockWindow({} as any);
      requestFp.mockImplementationOnce(() => TE.left(new UnknownEnvError()));
      await pipe(
        isTMAFp('complete'),
        TE.match(
          () => expect.unreachable(),
          result => expect(result).toBe(false),
        ),
      )();
      expect.assertions(1);
    });
  });

  describe('sync', () => {
    beforeEach(() => {
      mockWindow({ location: { href: '' } } as any);
    });

    it('should return true if env contains launch params', () => {
      vi
        .spyOn(window.location, 'href', 'get')
        .mockImplementation(() => {
          return '/abc?tgWebAppStartParam=START#tgWebAppPlatform=tdesktop&tgWebAppVersion=7.0&tgWebAppThemeParams=%7B%7D';
        });
      expect(isTMAFp()).toBe(true);
    });

    it('should return false if env doesnt contain launch params', () => {
      expect(isTMAFp()).toBe(false);
    });
  });
});
