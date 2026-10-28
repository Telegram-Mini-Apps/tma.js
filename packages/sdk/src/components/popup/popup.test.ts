import { MethodUnsupportedError, TimeoutError } from '@tma.js/bridge';
import { describe, expect, it, vi } from 'vitest';

import { createPopup, preparePopupParams } from './popup.js';
import { respond, setup } from '../../../test/utils.js';
import { ConcurrentCallError, InvalidArgumentsError } from '../../errors.js';

describe('preparePopupParams', () => {
  it('should trim values and add the close button if there are no buttons', () => {
    expect(preparePopupParams({ message: ' m ', title: ' t ' })).toEqual({
      data: { buttons: [{ id: '', type: 'close' }], message: 'm', title: 't' },
      ok: true,
    });
  });

  it('should prepare buttons', () => {
    expect(preparePopupParams({
      buttons: [{ text: ' a ' }, { id: 'b', text: 'b', type: 'destructive' }, { type: 'ok' }],
      message: 'm',
    })).toEqual({
      data: {
        buttons: [
          { id: '', text: 'a', type: 'default' },
          { id: 'b', text: 'b', type: 'destructive' },
          { id: '', type: 'ok' },
        ],
        message: 'm',
        title: '',
      },
      ok: true,
    });
  });

  it.each([
    { message: 'm', title: 'a'.repeat(65) },
    { message: '' },
    { message: 'a'.repeat(257) },
    { buttons: [{ type: 'ok' }, { type: 'ok' }, { type: 'ok' }, { type: 'ok' }], message: 'm' },
    { buttons: [{ id: 'a'.repeat(65), type: 'ok' }], message: 'm' },
    { buttons: [{ text: ' ' }], message: 'm' },
  ] as const)('should return InvalidArgumentsError for %j', options => {
    const result = preparePopupParams(options as any);
    expect(!result.ok && InvalidArgumentsError.is(result.error)).toBe(true);
  });
});

describe('popup', () => {
  it('should show the popup and return the pressed button', async () => {
    const calls = setup({
      onMethod: respond('web_app_open_popup', 'popup_closed', { button_id: 'ok' }),
    });
    const popup = createPopup();
    await expect(popup.show({ buttons: [{ id: 'ok', type: 'ok' }], message: 'm' }))
      .resolves
      .toBe('ok');
    expect(calls).toHaveBeenCalledWith({
      name: 'web_app_open_popup',
      params: { buttons: [{ id: 'ok', type: 'ok' }], message: 'm', title: '' },
    });
    expect(popup.isOpened()).toBe(false);
  });

  it('should return undefined if no button was pressed', async () => {
    setup({ onMethod: respond('web_app_open_popup', 'popup_closed', {}) });
    await expect(createPopup().show({ message: 'm' })).resolves.toBeUndefined();
  });

  it('should throw ConcurrentCallError if a popup is opened', async () => {
    setup();
    const popup = createPopup();
    const listener = vi.fn();
    popup.isOpened.subscribe(listener);
    void popup.show({ message: 'm' });
    expect(popup.isOpened()).toBe(true);
    expect(listener).toHaveBeenCalledExactlyOnceWith(true, false);
    await expect(popup.show({ message: 'm' })).rejects.toThrow(ConcurrentCallError);
  });

  it('should return InvalidArgumentsError without calling the method', async () => {
    const calls = setup();
    const result = await createPopup().safeShow({ message: '' });
    expect(!result.ok && InvalidArgumentsError.is(result.error)).toBe(true);
    expect(calls).not.toHaveBeenCalled();
  });

  it('should return TimeoutError', async () => {
    vi.useFakeTimers();
    setup();
    const popup = createPopup();
    const promise = popup.safeShow({ message: 'm', timeout: 100 });
    await vi.advanceTimersByTimeAsync(100);
    const result = await promise;
    expect(!result.ok && TimeoutError.is(result.error)).toBe(true);
    expect(popup.isOpened()).toBe(false);
    vi.useRealTimers();
  });

  it('should reject with MethodUnsupportedError before v6.2', async () => {
    setup({ version: '6.1' });
    await expect(createPopup().show({ message: 'm' })).rejects.toThrow(MethodUnsupportedError);
  });
});
