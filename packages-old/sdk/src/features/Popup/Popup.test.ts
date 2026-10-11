import { taskEither as TE } from 'fp-ts';
import { describe, expect, it, vi } from 'vitest';

import { testIsSupportedPure } from '~/test-utils/predefined/testIsSupportedPure.js';
import { testSafetyPure } from '~/test-utils/predefined/testSafetyPure.js';
import type { InstantiateOptions } from '~/test-utils/types.js';

import { Popup, type PopupOptions } from '@/features/Popup/Popup.js';

const MIN_VERSION = '6.2';

function instantiate({
  version = MIN_VERSION,
  request = () => TE.right(undefined),
  isTma = true,
}: InstantiateOptions<PopupOptions> = {}) {
  return new Popup({ version, request, isTma });
}

describe.each([
  ['show', (component: Popup) => component.show({ message: '' })],
] as const)('%s', (method, tryCall) => {
  describe('safety', () => {
    testSafetyPure({
      instantiate,
      get: instance => instance[method],
      try: tryCall,
      minVersion: MIN_VERSION,
    });
  });
});

describe('show', () => {
  it(
    'should call request with "web_app_open_popup" and catch "popup_closed"',
    async () => {
      const request = vi.fn(() => TE.right({ button_id: '1' }));
      const component = instantiate({ request });
      await component.show({
        title: 'Title',
        message: 'Some message',
        buttons: [{ type: 'ok' }, { type: 'cancel' }],
      });
      expect(request).toHaveBeenCalledOnce();
      expect(request).toHaveBeenCalledWith(
        'web_app_open_popup', 'popup_closed', expect.objectContaining({
          params: {
            title: 'Title',
            message: 'Some message',
            buttons: [{ id: '', type: 'ok' }, { id: '', type: 'cancel' }],
          },
        }),
      );
    },
  );
});

describe('isSupported', () => {
  testIsSupportedPure(version => instantiate({ isTma: true, version }), MIN_VERSION);
});
