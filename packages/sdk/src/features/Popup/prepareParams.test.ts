import { either as E } from 'fp-ts';
import { expect, it, describe } from 'vitest';

import { InvalidArgumentsError } from '@/errors.js';

import { prepareParams } from './prepareParams.js';

/**
 * Creates test text.
 * @param length - text length.
 */
function text(length: number): string {
  return new Array(length)
    .fill('a')
    .join('');
}

function createError(message: string) {
  return E.left(new InvalidArgumentsError(message));
}

const anyRight = E.right(expect.anything());

describe('title', () => {
  it('should return error if title length > 64', () => {
    const title = text(65);
    expect(prepareParams({ title, message: 'Hey!' })).toStrictEqual(
      createError(`Invalid title: ${title}`),
    );
    expect(prepareParams({ title: text(64), message: 'Hey!' })).toStrictEqual(anyRight);
  });
});

describe('message', () => {
  it('should return error if message length is out of [1, 256]', () => {
    expect(prepareParams({ message: '' })).toStrictEqual(createError('Invalid message: '));

    const message = text(257);
    expect(prepareParams({ message })).toStrictEqual(
      createError(`Invalid message: ${message}`),
    );
    expect(prepareParams({ message: text(256) })).toStrictEqual(anyRight);
  });
});

describe('buttons', () => {
  it('should return error if buttons count > 3', () => {
    expect(prepareParams({
      message: 'a',
      buttons: new Array(4),
    })).toStrictEqual(createError('Invalid buttons count: 4'));

    expect(prepareParams({
      message: 'a',
      buttons: new Array(3).fill({ type: 'close' }),
    })).toStrictEqual(anyRight);
  });

  it('should append button type "close" if buttons array is empty', () => {
    expect(prepareParams({ message: 'a' })).toStrictEqual(E.right(expect.objectContaining({
      buttons: [{ type: 'close', id: '' }],
    })));
  });

  describe('button', () => {
    it('should return error if id length > 64', () => {
      const id = text(65);
      expect(prepareParams({
        message: 'A',
        buttons: [
          { type: 'ok', id: text(1) },
          { type: 'ok', id },
        ],
      })).toStrictEqual(createError(`Button with index 1 has invalid id: ${id}`));

      expect(prepareParams({
        message: 'A',
        buttons: [
          { type: 'ok', id: text(1) },
          { type: 'ok', id: text(64) },
        ],
      })).toStrictEqual(anyRight);
    });

    it.each([
      undefined,
      'default',
      'destructive',
    ] as const)(
      'should return error if text length is out of [0, 64] and button type is %s',
      type => {
        const invalidText = text(65);
        expect(prepareParams({
          message: 'A',
          buttons: [{ type, text: invalidText }],
        })).toStrictEqual(createError(`Button with index 0 has invalid text: ${invalidText}`));

        expect(prepareParams({
          message: 'A',
          buttons: [{ type, text: text(64) }],
        })).toStrictEqual(anyRight);
      },
    );
  });
});

it('should fulfill all optional popup parameters', () => {
  expect(prepareParams({
    message: 'Message',
    buttons: [{ type: 'default', text: 'Wow!' }, { type: 'close' }],
  })).toStrictEqual(E.right({
    title: '',
    message: 'Message',
    buttons: [{ id: '', type: 'default', text: 'Wow!' }, { type: 'close', id: '' }],
  }));
});
