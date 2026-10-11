import { createWindow } from 'test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resetGlobals } from '@/globals.js';

import { off, on } from './emitter.js';

const receiveEventMock = vi.fn(() => null);

function emitMiniAppsEvent(eventType: string, eventData: any) {
  (window as any).Telegram?.WebView?.receiveEvent?.(eventType, eventData);
}

function mockTelegramSDK() {
  const wnd = window as any;

  // This code repeats the same actions as described in the Telegram SDK.
  if (!wnd.Telegram) {
    wnd.Telegram = {};
  }
  wnd.Telegram.WebView = {
    someUtil: 123,
    andSomethingElse: 'wow',
    receiveEvent: receiveEventMock,
  };
  wnd.TelegramGameProxy = { receiveEvent: receiveEventMock };
  wnd.TelegramGameProxy_receiveEvent = receiveEventMock;
}

beforeEach(() => {
  resetGlobals();
  vi.restoreAllMocks();
  createWindow();
});

describe('telegram SDK connected last', () => {
  describe('on', () => {
    it('should call both listeners if the corresponding event was emitted', () => {
      const listener = vi.fn();
      on('viewport_changed', listener);
      mockTelegramSDK();

      const eventData = {
        height: 123,
        width: 321,
        is_expanded: false,
        is_state_stable: false,
      };
      emitMiniAppsEvent('viewport_changed', eventData);
      emitMiniAppsEvent('theme_changed', { theme_params: {} });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(eventData);
      expect(receiveEventMock).toHaveBeenCalledTimes(2);
      expect(receiveEventMock).toHaveBeenNthCalledWith(1, 'viewport_changed', eventData);
      expect(receiveEventMock).toHaveBeenNthCalledWith(2, 'theme_changed', { theme_params: {} });
    });

    it(
      'should remove listener after being called if "once" option was passed, but leave Telegram SDKs handler working',
      () => {
        const listener = vi.fn();
        on('viewport_changed', listener, true);
        mockTelegramSDK();

        const eventData = {
          height: 123,
          width: 321,
          is_expanded: false,
          is_state_stable: false,
        };
        emitMiniAppsEvent('viewport_changed', eventData);
        emitMiniAppsEvent('viewport_changed', eventData);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(receiveEventMock).toHaveBeenCalledTimes(2);
        expect(receiveEventMock).toHaveBeenNthCalledWith(1, 'viewport_changed', eventData);
        expect(receiveEventMock).toHaveBeenNthCalledWith(2, 'viewport_changed', eventData);
      },
    );

    it(
      'should remove listener if returned callback was called, but leave Telegram SDKs handler working',
      () => {
        const listener = vi.fn();
        const eventData = {
          height: 123,
          width: 321,
          is_expanded: false,
          is_state_stable: false,
        };
        const emit = () => emitMiniAppsEvent('viewport_changed', eventData);

        const off = on('viewport_changed', listener);
        mockTelegramSDK();
        emit();
        expect(listener).toHaveBeenCalledTimes(1);
        expect(receiveEventMock).toHaveBeenCalledTimes(1);
        expect(receiveEventMock).toHaveBeenNthCalledWith(1, 'viewport_changed', eventData);

        off();
        emit();
        expect(listener).toHaveBeenCalledTimes(1);
        expect(receiveEventMock).toHaveBeenCalledTimes(2);
        expect(receiveEventMock).toHaveBeenNthCalledWith(2, 'viewport_changed', eventData);
      },
    );

    it(
      'should subscribe to all events if "*" passed and also pass them to the Telegram SDK\'s handler',
      () => {
        const listener = vi.fn();
        on('*', listener);
        mockTelegramSDK();

        const eventData = {
          height: 123,
          width: 321,
          is_expanded: false,
          is_state_stable: false,
        };
        emitMiniAppsEvent('viewport_changed', eventData);
        emitMiniAppsEvent('theme_changed', { theme_params: {} });

        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenNthCalledWith(
          1,
          { name: 'viewport_changed', payload: eventData },
        );
        expect(listener).toHaveBeenNthCalledWith(
          2,
          { name: 'theme_changed', payload: { theme_params: {} } },
        );
        expect(receiveEventMock).toHaveBeenCalledTimes(2);
        expect(receiveEventMock).toHaveBeenNthCalledWith(1, 'viewport_changed', eventData);
        expect(receiveEventMock).toHaveBeenNthCalledWith(2, 'theme_changed', { theme_params: {} });
      },
    );

    it('should define mini apps event listeners', () => {
      on('*', vi.fn());
      mockTelegramSDK();
      expect(window).toMatchObject({
        TelegramGameProxy_receiveEvent: expect.any(Function),
        TelegramGameProxy: { receiveEvent: expect.any(Function) },
        Telegram: { WebView: { receiveEvent: expect.any(Function) } },
      });
    });

    describe('events process', () => {
      describe.each([
        {
          event: 'viewport_changed',
          input: {
            height: 120,
            width: 300,
            is_expanded: true,
            is_state_stable: false,
          },
        },
        {
          event: 'theme_changed',
          input: {
            theme_params: {
              bg_color: '#aabbdd',
              text_color: '#113322',
              hint_color: '#132245',
              link_color: '#133322',
              button_color: '#a23135',
              button_text_color: '#aa213f',
            },
          },
        },
        {
          event: 'popup_closed',
          cases: [
            [{ button_id: 'ok' }, { button_id: 'ok' }],
            [{ button_id: null }, {}],
            [{ button_id: undefined }, {}],
            [null, {}],
            [undefined, {}],
          ],
        },
        { event: 'set_custom_style', input: '.scroll {}' },
        { event: 'qr_text_received', input: { data: 'some QR data' } },
        { event: 'main_button_pressed' },
        { event: 'back_button_pressed' },
        { event: 'settings_button_pressed' },
        { event: 'scan_qr_popup_closed' },
        {
          event: 'clipboard_text_received',
          input: { req_id: 'request id', data: 'clipboard value' },
        },
        { event: 'invoice_closed', input: { slug: '&&*Sh1j213kx', status: 'PAID' } },
        { event: 'phone_requested', input: { status: 'sent' } },
        {
          event: 'custom_method_invoked',
          cases: [
            [{ req_id: '1', result: 'My result' }],
            [{ req_id: '2', error: 'Something is wrong' }],
          ],
        },
        { event: 'write_access_requested', input: { status: 'allowed' } },
        {
          event: 'unknown_event',
          cases: [
            ['hello', 'hello'],
            [{ there: true }, { there: true }],
          ],
        },
      ])('$event', test => {
        const { event } = test;

        if ('cases' in test) {
          test.cases?.forEach(([input, expected = input], idx) => {
            it(`should properly process case ${idx}`, () => {
              const listener = vi.fn();
              on(event as any, listener);
              mockTelegramSDK();
              emitMiniAppsEvent(event, input);
              expect(listener).toHaveBeenCalledTimes(1);
              expect(listener).toHaveBeenCalledWith(expected);
              expect(receiveEventMock).toHaveBeenCalledTimes(1);
              expect(receiveEventMock).toHaveBeenCalledWith(event, input);
            });
          });
          return;
        }

        it('should properly process event', () => {
          const listener = vi.fn();
          on(event as any, listener);
          mockTelegramSDK();
          emitMiniAppsEvent(event, test.input);
          expect(listener).toHaveBeenCalledTimes(1);
          expect(listener).toHaveBeenCalledWith(test.input);
          expect(receiveEventMock).toHaveBeenCalledTimes(1);
          expect(receiveEventMock).toHaveBeenCalledWith(event, test.input);
        });
      });
    });

    it('should format theme_params if it was in int', () => {
      const listener = vi.fn();
      on('theme_changed', listener);
      mockTelegramSDK();

      // We are just testing an invalid Android client behavior here.
      const eventData = {
        theme_params: {
          accent_text_color: -10177041,
          bg_color: -14602949,
          bottom_bar_bg_color: -15393241,
          button_color: -11491093,
          button_text_color: -1,
          destructive_text_color: -1152913,
          header_bg_color: -14406343,
          hint_color: -8549479,
          link_color: -10572831,
          secondary_bg_color: -15393241,
          section_bg_color: -14866637,
          section_header_text_color: -8796932,
          section_separator_color: -15920616,
          subtitle_text_color: -8681584,
          text_color: -1,
        },
        // We are just testing an invalid Android client behavior here.
      } as any;
      emitMiniAppsEvent('theme_changed', eventData);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        theme_params: {
          accent_text_color: '#64b5ef',
          bg_color: '#212d3b',
          bottom_bar_bg_color: '#151e27',
          button_color: '#50a8eb',
          button_text_color: '#ffffff',
          destructive_text_color: '#ee686f',
          header_bg_color: '#242d39',
          hint_color: '#7d8b99',
          link_color: '#5eabe1',
          secondary_bg_color: '#151e27',
          section_bg_color: '#1d2733',
          section_header_text_color: '#79c4fc',
          section_separator_color: '#0d1218',
          subtitle_text_color: '#7b8790',
          text_color: '#ffffff',
        },
      });
      expect(receiveEventMock).toHaveBeenCalledTimes(1);
      expect(receiveEventMock).toHaveBeenCalledWith('theme_changed', eventData);
    });
  });

  describe('off', () => {
    it('should remove listener, but leave Telegram SDK\'s handler', () => {
      const listener = vi.fn();
      const eventData = {
        height: 123,
        width: 321,
        is_expanded: false,
        is_state_stable: false,
      };
      const emit = () => emitMiniAppsEvent('viewport_changed', eventData);

      on('viewport_changed', listener);
      mockTelegramSDK();
      emit();
      expect(listener).toHaveBeenCalledTimes(1);
      expect(receiveEventMock).toHaveBeenCalledTimes(1);
      expect(receiveEventMock).toHaveBeenCalledWith('viewport_changed', eventData);

      off('viewport_changed', listener);
      emit();
      expect(listener).toHaveBeenCalledTimes(1);
      expect(receiveEventMock).toHaveBeenCalledTimes(2);
      expect(receiveEventMock).toHaveBeenNthCalledWith(2, 'viewport_changed', eventData);
    });

    it(
      'should remove mini apps event listeners when no listeners left, but leave Telegram SDK\'s handler',
      () => {
        const listener = vi.fn();
        on('*', listener);
        mockTelegramSDK();
        expect(window).toMatchObject({
          TelegramGameProxy_receiveEvent: expect.any(Function),
          TelegramGameProxy: { receiveEvent: expect.any(Function) },
          Telegram: { WebView: { receiveEvent: expect.any(Function) } },
        });
        off('*', listener);
        expect(window).toMatchObject({
          TelegramGameProxy_receiveEvent: receiveEventMock,
          TelegramGameProxy: { receiveEvent: receiveEventMock },
          Telegram: { WebView: { receiveEvent: receiveEventMock } },
        });
      },
    );
  });
});

describe('telegram SDK not connected', () => {
  describe('on', () => {
    it('should call listener if the corresponding event was emitted', () => {
      const listener = vi.fn();
      on('viewport_changed', listener);

      const eventData = {
        height: 123,
        width: 321,
        is_expanded: false,
        is_state_stable: false,
      };
      emitMiniAppsEvent('viewport_changed', eventData);
      emitMiniAppsEvent('theme_changed', { theme_params: {} });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(eventData);
    });

    it('should remove listener after being called if "once" option was passed', () => {
      const listener = vi.fn();
      on('viewport_changed', listener, true);

      const eventData = {
        height: 123,
        width: 321,
        is_expanded: false,
        is_state_stable: false,
      };
      emitMiniAppsEvent('viewport_changed', eventData);
      emitMiniAppsEvent('viewport_changed', eventData);

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should remove listener if returned callback was called', () => {
      const listener = vi.fn();
      const emit = () => emitMiniAppsEvent('viewport_changed', {
        height: 123,
        width: 321,
        is_expanded: false,
        is_state_stable: false,
      });

      const off = on('viewport_changed', listener);
      emit();
      expect(listener).toHaveBeenCalledTimes(1);

      off();
      emit();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should subscribe to all events if "*" passed', () => {
      const listener = vi.fn();
      on('*', listener);

      emitMiniAppsEvent('viewport_changed', {
        height: 123,
        width: 321,
        is_expanded: false,
        is_state_stable: false,
      });
      emitMiniAppsEvent('theme_changed', { theme_params: {} });

      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenNthCalledWith(1, {
        name: 'viewport_changed',
        payload: {
          height: 123,
          width: 321,
          is_expanded: false,
          is_state_stable: false,
        },
      });
      expect(listener).toHaveBeenNthCalledWith(2, {
        name: 'theme_changed',
        payload: { theme_params: {} },
      });
    });

    it('should define mini apps event listeners', () => {
      createWindow();
      on('*', vi.fn());
      expect(window).toMatchObject({
        TelegramGameProxy_receiveEvent: expect.any(Function),
        TelegramGameProxy: { receiveEvent: expect.any(Function) },
        Telegram: { WebView: { receiveEvent: expect.any(Function) } },
      });
    });

    describe('events process', () => {
      describe.each([
        {
          event: 'viewport_changed',
          input: {
            height: 120,
            width: 300,
            is_expanded: true,
            is_state_stable: false,
          },
        },
        {
          event: 'theme_changed',
          input: {
            theme_params: {
              bg_color: '#aabbdd',
              text_color: '#113322',
              hint_color: '#132245',
              link_color: '#133322',
              button_color: '#a23135',
              button_text_color: '#aa213f',
            },
          },
        },
        {
          event: 'popup_closed',
          cases: [
            [{ button_id: 'ok' }, { button_id: 'ok' }],
            [{ button_id: null }, {}],
            [{ button_id: undefined }, {}],
            [null, {}],
            [undefined, {}],
          ],
        },
        { event: 'set_custom_style', input: '.scroll {}' },
        { event: 'qr_text_received', input: { data: 'some QR data' } },
        { event: 'main_button_pressed' },
        { event: 'back_button_pressed' },
        { event: 'settings_button_pressed' },
        { event: 'scan_qr_popup_closed' },
        {
          event: 'clipboard_text_received',
          input: { req_id: 'request id', data: 'clipboard value' },
        },
        { event: 'invoice_closed', input: { slug: '&&*Sh1j213kx', status: 'PAID' } },
        { event: 'phone_requested', input: { status: 'sent' } },
        {
          event: 'custom_method_invoked',
          cases: [
            [{ req_id: '1', result: 'My result' }],
            [{ req_id: '2', error: 'Something is wrong' }],
          ],
        },
        { event: 'write_access_requested', input: { status: 'allowed' } },
        {
          event: 'unknown_event',
          cases: [
            ['hello', 'hello'],
            [{ there: true }, { there: true }],
          ],
        },
      ])('$event', test => {
        const { event } = test;

        if ('cases' in test) {
          test.cases?.forEach(([input, expected = input], idx) => {
            it(`should properly process case ${idx}`, () => {
              const listener = vi.fn();
              on(event as any, listener);
              emitMiniAppsEvent(event, input);
              expect(listener).toHaveBeenCalledTimes(1);
              expect(listener).toHaveBeenCalledWith(expected);
            });
          });
          return;
        }

        it('should properly process event', () => {
          const listener = vi.fn();
          on(event as any, listener);
          emitMiniAppsEvent(event, test.input);
          expect(listener).toHaveBeenCalledTimes(1);
          expect(listener).toHaveBeenCalledWith(test.input);
        });
      });
    });

    it('should format theme_params if it was in int', () => {
      const listener = vi.fn();
      on('theme_changed', listener);

      emitMiniAppsEvent('theme_changed', {
        theme_params: {
          accent_text_color: -10177041,
          bg_color: -14602949,
          bottom_bar_bg_color: -15393241,
          button_color: -11491093,
          button_text_color: -1,
          destructive_text_color: -1152913,
          header_bg_color: -14406343,
          hint_color: -8549479,
          link_color: -10572831,
          secondary_bg_color: -15393241,
          section_bg_color: -14866637,
          section_header_text_color: -8796932,
          section_separator_color: -15920616,
          subtitle_text_color: -8681584,
          text_color: -1,
        },
        // We are just testing an invalid Android client behavior here.
      } as any);

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        theme_params: {
          accent_text_color: '#64b5ef',
          bg_color: '#212d3b',
          bottom_bar_bg_color: '#151e27',
          button_color: '#50a8eb',
          button_text_color: '#ffffff',
          destructive_text_color: '#ee686f',
          header_bg_color: '#242d39',
          hint_color: '#7d8b99',
          link_color: '#5eabe1',
          secondary_bg_color: '#151e27',
          section_bg_color: '#1d2733',
          section_header_text_color: '#79c4fc',
          section_separator_color: '#0d1218',
          subtitle_text_color: '#7b8790',
          text_color: '#ffffff',
        },
      });
    });
  });

  describe('off', () => {
    it('should remove listener', () => {
      const listener = vi.fn();
      const emit = () => emitMiniAppsEvent('viewport_changed', {
        height: 123,
        width: 321,
        is_expanded: false,
        is_state_stable: false,
      });

      on('viewport_changed', listener);
      emit();
      expect(listener).toHaveBeenCalledTimes(1);

      off('viewport_changed', listener);
      emit();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should remove mini apps event listeners when no listeners left', () => {
      createWindow();
      const listener = vi.fn();
      on('*', listener);
      expect(window).toMatchObject({
        TelegramGameProxy_receiveEvent: expect.any(Function),
        TelegramGameProxy: { receiveEvent: expect.any(Function) },
        Telegram: { WebView: { receiveEvent: expect.any(Function) } },
      });
      off('*', listener);
      expect(window).not.toHaveProperty('TelegramGameProxy_receiveEvent');
      expect(window).not.toHaveProperty('TelegramGameProxy');
      expect(window).not.toHaveProperty('Telegram');
    });
  });
});
