/**
 * Packages from the "packages2" directory are imported from their sources, so any change in them
 * is applied immediately. See the "paths" option in tsconfig.json.
 */
import {
  emitEvent,
  hasWebviewProxy,
  isIframe,
  mockTelegramEnv,
  onAnyEvent,
  postEvent,
  retrieveLaunchParams,
  retrieveRawInitData,
  setDebug,
} from '@tma.js/bridge';
import { parse, sign, validate } from '@tma.js/init-data';

// Fake bot token used to sign mocked init data.
const BOT_TOKEN = '1234567890:playground';

function log(title: string, value?: unknown): void {
  const item = document.createElement('pre');
  item.textContent = value === undefined ? title : `${title}\n${JSON.stringify(value, null, 2)}`;
  document.body.append(item);
  console.log(title, value);
}

setDebug(true);

// Outside Telegram, imitate the Telegram client.
const mocked = !hasWebviewProxy() && !isIframe();
if (mocked) {
  mockTelegramEnv({
    launchParams: {
      tgWebAppPlatform: 'tdesktop',
      tgWebAppVersion: '9.0',
      tgWebAppThemeParams: { bg_color: '#ffffff', text_color: '#000000' },
      tgWebAppData: await sign({
        user: { id: 1, first_name: 'Pavel' },
        chat_instance: '1',
        chat_type: 'sender',
      }, BOT_TOKEN),
    },
    onMethod({ name, params }) {
      log(`Method called: ${name}`, params);
      if (name === 'web_app_request_theme') {
        emitEvent('theme_changed', { theme_params: { bg_color: '#ffffff' } });
      }
    },
  });
  log('Environment was mocked');
}

onAnyEvent(({ name, payload }) => log(`Event received: ${name}`, payload));

log('Launch parameters', retrieveLaunchParams());

const rawInitData = retrieveRawInitData();
if (rawInitData) {
  // Only mocked init data can be validated, as the real bot token is unknown.
  log('Init data', mocked ? await validate(rawInitData, BOT_TOKEN) : parse(rawInitData));
}

postEvent('web_app_ready');
postEvent('web_app_request_theme');
