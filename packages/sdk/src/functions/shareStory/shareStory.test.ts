import { MethodUnsupportedError } from '@tma.js/bridge';
import { describe, expect, it } from 'vitest';

import { shareStory } from './shareStory.js';
import { setup } from '../../../test/utils.js';

describe('shareStory', () => {
  it('should share the story', () => {
    const calls = setup();
    shareStory('https://example.com/a.png', {
      text: 't',
      widgetLink: { name: 'n', url: 'https://t.me' },
    });
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_share_to_story',
      params: {
        media_url: 'https://example.com/a.png',
        text: 't',
        widget_link: { name: 'n', url: 'https://t.me' },
      },
    });
  });

  it('should throw MethodUnsupportedError before v7.8', () => {
    setup({ version: '7.7' });
    expect(() => shareStory('https://example.com/a.png')).toThrow(MethodUnsupportedError);
  });
});

describe('isSupported', () => {
  it('should check the Mini Apps version', () => {
    expect(shareStory.isSupported()).toBe(false);
    setup({ version: '7.7' });
    expect(shareStory.isSupported()).toBe(false);
    setup({ version: '7.8' });
    expect(shareStory.isSupported()).toBe(true);
  });
});
