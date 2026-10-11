/**
 * Packages from the "packages" directory are imported from their sources, so any change in them
 * is applied immediately. See the "paths" option in tsconfig.json.
 *
 * The SDK re-exports the bridge. Import bridge functions from the SDK, so both use the same bridge
 * instance.
 */
import { parse, sign, validate } from '@tma.js/init-data';
import {
  backButton,
  emitEvent,
  hasWebviewProxy,
  init,
  initData,
  isIframe,
  mainButton,
  miniApp,
  mockTelegramEnv,
  onAnyEvent,
  popup,
  retrieveLaunchParams,
  setDebug,
  themeParams,
  viewport,
} from '@tma.js/sdk';

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
      tgWebAppThemeParams: { bg_color: '#ffffff', text_color: '#000000', button_color: '#2481cc' },
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
      if (name === 'web_app_request_safe_area') {
        emitEvent('safe_area_changed', { top: 0, bottom: 0, left: 0, right: 0 });
      }
      if (name === 'web_app_request_content_safe_area') {
        emitEvent('content_safe_area_changed', { top: 0, bottom: 0, left: 0, right: 0 });
      }
      if (name === 'web_app_open_popup') {
        emitEvent('popup_closed', { button_id: 'ok' });
      }
    },
  });
  log('Environment was mocked');
}

onAnyEvent(({ name, payload }) => log(`Event received: ${name}`, payload));

log('Launch parameters', retrieveLaunchParams());

init();
miniApp.mount();
miniApp.bindCssVars();
themeParams.bindCssVars();
await viewport.mount();
viewport.bindCssVars();
miniApp.ready();

initData.restore();
const rawInitData = initData.raw();
if (rawInitData) {
  // Only mocked init data can be validated, as the real bot token is unknown.
  log('Init data', mocked ? await validate(rawInitData, BOT_TOKEN) : parse(rawInitData));
}

backButton.mount();
backButton.show();
backButton.onClick(() => log('Back button clicked'));

mainButton.mount();
mainButton.setParams({ text: 'Show popup', isVisible: true });
mainButton.onClick(async () => {
  const buttonId = await popup.show({
    title: 'Playground',
    message: 'The main button was clicked',
    buttons: [{ id: 'ok', type: 'ok' }],
  });
  log('Popup closed', { buttonId });
});

log('Viewport', viewport.state());
