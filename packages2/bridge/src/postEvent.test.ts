import { describe, expect, it, vi } from 'vitest';

import { UnknownEnvError } from './errors.js';
import { postEvent, setTargetOrigin } from './postEvent.js';
import { catchError } from '../test/catchError.js';

const w = window as any;

function mockIframe() {
  vi.spyOn(window, 'top', 'get').mockReturnValue({} as Window);
}

describe('postEvent', () => {
  it('should use TelegramWebviewProxy.postEvent with stringified params', () => {
    const proxyPostEvent = vi.fn();
    w.TelegramWebviewProxy = { postEvent: proxyPostEvent };
    postEvent('web_app_setup_back_button', { is_visible: true });
    expect(proxyPostEvent).toHaveBeenCalledWith('web_app_setup_back_button', '{"is_visible":true}');
  });

  it('should pass an empty string as params if they are missing, as the official SDK does', () => {
    const proxyPostEvent = vi.fn();
    w.TelegramWebviewProxy = { postEvent: proxyPostEvent };
    postEvent('web_app_ready');
    expect(proxyPostEvent).toHaveBeenCalledWith('web_app_ready', '""');
  });

  it('should prefer the iframe over TelegramWebviewProxy', () => {
    mockIframe();
    const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => undefined);
    const proxyPostEvent = vi.fn();
    w.TelegramWebviewProxy = { postEvent: proxyPostEvent };
    postEvent('web_app_ready');
    expect(postMessage).toHaveBeenCalledOnce();
    expect(proxyPostEvent).not.toHaveBeenCalled();
  });

  it('should use window.external.notify', () => {
    const notify = vi.fn();
    vi.stubGlobal('external', { notify });
    postEvent('web_app_open_link', { url: 'https://example.com' });
    expect(notify).toHaveBeenCalledWith(
      '{"eventType":"web_app_open_link","eventData":{"url":"https://example.com"}}',
    );
  });

  it('should post a message to the parent window with the target origin in iframe', () => {
    mockIframe();
    const postMessage = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => undefined);
    setTargetOrigin('https://example.com');
    postEvent('web_app_expand');
    expect(postMessage).toHaveBeenCalledWith(
      '{"eventType":"web_app_expand","eventData":""}',
      'https://example.com',
    );
  });

  it('should throw UnknownEnvError in an unknown environment', () => {
    expect(catchError(() => postEvent('web_app_ready'))).toSatisfy(e => UnknownEnvError.is(e));
  });
});
