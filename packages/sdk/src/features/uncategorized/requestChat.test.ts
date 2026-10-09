import type { Request2FpFn } from '@tma.js/bridge';
import { taskEither as TE } from 'fp-ts';
import { describe, expect, it, vi } from 'vitest';

import { createRequestChat, type CreateRequestChatOptions } from './requestChat.js';

function instantiate({
  version = '9.6',
  request = (() => TE.right({ event: 'requested_chat_sent' })) as unknown as Request2FpFn,
  isTma = true,
}: Partial<CreateRequestChatOptions> = {}) {
  return createRequestChat({ isTma, request, version });
}

describe('version is lower than 9.6', () => {
  it('should return FunctionNotAvailableError', async () => {
    await expect(instantiate({ version: '9.5' })('id')()).resolves.toMatchObject({
      _tag: 'Left',
      left: { name: 'FunctionNotAvailableError' },
    });
  });
});

describe('version is at least 9.6', () => {
  it('should call "web_app_request_chat" with req_id and capture requested_chat events', async () => {
    const request = vi.fn(() => TE.right({ event: 'requested_chat_sent' }));
    await instantiate({ request: request as unknown as Request2FpFn })('abc')();
    expect(request).toHaveBeenCalledExactlyOnceWith(
      'web_app_request_chat',
      ['requested_chat_failed', 'requested_chat_sent'],
      { params: { req_id: 'abc' } },
    );
  });

  it('should resolve with undefined if requested_chat_sent was received', async () => {
    await expect(instantiate()('abc')()).resolves.toStrictEqual({
      _tag: 'Right',
      right: undefined,
    });
  });

  it('should return RequestChatError if requested_chat_failed was received', async () => {
    const result = await instantiate({
      request: (() => TE.right({
        event: 'requested_chat_failed',
        payload: { error: 'UNKNOWN_ERROR' },
      })) as unknown as Request2FpFn,
    })('abc')();
    expect(result).toMatchObject({
      _tag: 'Left',
      left: { name: 'RequestChatError', message: 'UNKNOWN_ERROR' },
    });
  });
});
