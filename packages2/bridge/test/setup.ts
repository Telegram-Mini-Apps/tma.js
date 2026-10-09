import { afterEach } from 'vitest';

import { offAll } from '../src/events.js';
import { setDebug, setLogger } from '../src/logger.js';
import { setTargetOrigin } from '../src/postEvent.js';

afterEach(() => {
  offAll();
  setDebug(false);
  setLogger();
  setTargetOrigin('https://web.telegram.org');
  sessionStorage.clear();
  const w = window as any;
  ['Telegram', 'TelegramGameProxy', 'TelegramGameProxy_receiveEvent', 'TelegramWebviewProxy']
    .forEach(key => {
      delete w[key];
    });
});
