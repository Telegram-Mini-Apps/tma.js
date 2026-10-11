import { offAll, setDebug, setLogger } from '@tma.js/bridge';
import { afterEach } from 'vitest';

import { setGlobals } from '../src/globals.js';

afterEach(() => {
  offAll();
  setDebug(false);
  setLogger();
  setGlobals(undefined);
  sessionStorage.clear();
  document.documentElement.removeAttribute('style');
  document.head.innerHTML = '';
  const w = window as any;
  ['Telegram', 'TelegramGameProxy', 'TelegramGameProxy_receiveEvent', 'TelegramWebviewProxy']
    .forEach(key => {
      delete w[key];
    });
});
