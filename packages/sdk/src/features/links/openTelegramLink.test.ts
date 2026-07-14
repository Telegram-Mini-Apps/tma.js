import * as fp from 'fp-ts';
import { it, expect, afterEach, vi, describe } from 'vitest';

import { InvalidArgumentsError } from '@/errors.js';

import { createOpenTelegramLink, CreateOpenTelegramLinkOptions } from './openTelegramLink.js';

function instantiate({
  version = '6.0',
  postEvent = () => fp.either.right(undefined),
  isTma = true,
}: Partial<CreateOpenTelegramLinkOptions> = {}) {
  return createOpenTelegramLink({
    isTma,
    postEvent,
    version,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

it.each(['', 'https://a.com'])('should return error for link "%s"', link => {
  expect(instantiate()(link)).toMatchObject({
    left: new InvalidArgumentsError(`"${link}" is invalid URL`),
  });
});

describe('version is 6.0', () => {
  it.each([
    { link: 'https://t.me/a?b=c', path: '/a?b=c' },
    { link: 'https://telegram.me/d?e=f', path: '/d?e=f' },
    { link: 'https://telegram.dog/g?h=i', path: '/g?h=i' },
  ])('should call "web_app_open_tg_link" with path_full. Link is $link', ({ link, path }) => {
    const locationHrefSpy = vi.spyOn(window.location, 'href', 'set');
    instantiate({ version: '6.0' })(link);
    expect(locationHrefSpy).toHaveBeenCalledExactlyOnceWith('https://telegram.me' + path);
  });
});

describe('version is at least 6.1', () => {
  it.each([
    { link: 'https://t.me/a?b=c', path: '/a?b=c' },
    { link: 'https://telegram.me/d?e=f', path: '/d?e=f' },
    { link: 'https://telegram.dog/g?h=i', path: '/g?h=i' },
  ])('should call "web_app_open_tg_link" with path_full. Link is $link', ({ link, path }) => {
    const postEvent = vi.fn();
    instantiate({ version: '6.1', postEvent })(link);
    expect(postEvent).toHaveBeenCalledExactlyOnceWith('web_app_open_tg_link', { path_full: path });
  });
});
