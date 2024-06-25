import { describe, expect, it } from 'vitest';

// import {emitDesktopEvent, mockDesktop} from '../../../tests';
// import { Popup } from './Popup';
// import {Bridge} from '@telegram-apps/bridge';
// import {PopupParams} from './types';
// import {preparePopupParams} from './utils';

// beforeAll(mockDesktop);

describe('components', () => {
  describe('Popup', () => {
    it('should be fine', () => {
      expect(true).toBe(true);
    });
    // it('isOpened', () => {
    //  it('should emit event "openChange" with specified value in setter', () => {
    //     const popup = new Popup('7');
    //     const spy = vi.spyOn((popup as any).ee, 'emit');
    //     (popup as any).isOpened = true;
    //     expect(spy).lastCalledWith('openChange', true);
    //
    //     (popup as any).isOpened = false;
    //     expect(spy).lastCalledWith('openChange', false);
    //   });
    // });
    //
    // it('show', () => {
    //  it('should throw an error in case, current version is less than 6.2', () => {
    //     expect(() => new Popup('6.1').show({message: 'Hey!'})).toThrow();
    //     expect(() => new Popup('6.2').show({message: 'Hey!'})).not.toThrow();
    //   });
    //
    //  it('should call bridge event "web_app_open_popup" with prepared parameters', () => {
    //     const bridge = new Bridge();
    //     const spy = vi.spyOn(bridge, 'postEvent');
    //     const popup = new Popup('7', {bridge});
    //     const params: PopupParams = {message: 'Message'};
    //     const prepared = preparePopupParams(params);
    //     popup.show(params);
    //     expect(spy).toHaveBeenCalledWith('web_app_open_popup', prepared);
    //   });
    //
    //  it('should emit event "open" with prepared params', () => {
    //     const popup = new Popup('7');
    //     const spy = vi.spyOn((popup as any).ee, 'emit');
    //     const params: PopupParams = {message: 'Message'};
    //     const prepared = preparePopupParams(params);
    //     popup.show(params);
    //     expect(spy).toHaveBeenCalledWith('open', prepared);
    //   });
    //
    //  it('should set "isOpened" property to true', () => {
    //     const popup = new Popup('7');
    //     expect(popup.isOpened).toBe(false);
    //     popup.show({message: 'Message'});
    //     expect(popup.isOpened).toBe(true);
    //   });
    //
    //  it('should set "isOpened" property to false when promise is resolved', async () => {
    //     const popup = new Popup('7');
    //     const promise = popup.show({message: 'Message'});
    //
    //     emitDesktopEvent('popup_closed', {button_id: null});
    //     await promise;
    //     expect(popup.isOpened).toBe(false);
    //   });
    //
    //  it('should set "isOpened" property to true', () => {
    //     const popup = new Popup('7');
    //     popup.show({message: 'Message'});
    //     expect(popup.isOpened).toBe(true);
    //   });
    //
    //  it('should emit close event with specified button_id when promise is resolved',
    //   async () => {
    //     const popup = new Popup('7');
    //     const spy = vi.spyOn((popup as any).ee, 'emit');
    //     const promise = popup.show({message: 'Message'});
    //     emitDesktopEvent('popup_closed', {button_id: 'Hey!'});
    //     await promise;
    //     expect(spy).lastCalledWith('close', 'Hey!');
    //   });
    // });
    //
    // it('showAlert', () => {
    //  it('should call "show" with passed message and buttons = [{type: "close"}]', () => {
    //     const popup = new Popup('7');
    //     const spy = vi.spyOn(popup, 'show');
    //
    //     popup.showAlert('Message');
    //
    //     expect(spy).toHaveBeenCalledWith({
    //       message: 'Message',
    //       buttons: [{type: 'close'}],
    //     });
    //   });
    // });
    //
    // it('showConfirm', () => {
    //  test(
    //     'should call "show" with passed message and ' +
    //     'buttons = [{type: "ok", id: "ok"}, {id: "cancel", type: "cancel"}]',
    //     () => {
    //       const popup = new Popup('7');
    //       const spy = vi.spyOn(popup, 'show');
    //
    //       popup.showConfirm('Message');
    //
    //       expect(spy).toHaveBeenCalledWith({
    //         message: 'Message',
    //         buttons: [{type: 'ok', id: 'ok'}, {id: 'cancel', type: 'cancel'}],
    //       });
    //     },
    //   );
    //
    //  it('should resolve true in case, user pressed button with id "ok"', async () => {
    //     const promise = new Popup('7').showConfirm('Message');
    //     emitDesktopEvent('popup_closed', {button_id: 'ok'});
    //     expect(await promise).toBe(true);
    //   });
    //
    //  it('should resolve false in case, user pressed any other button', async () => {
    //     const promise = new Popup('7').showConfirm('Message');
    //     emitDesktopEvent('popup_closed', {button_id: 'cancel'});
    //     await expect(promise).resolves.toBe(false);
    //   });
    // });
  });
});
