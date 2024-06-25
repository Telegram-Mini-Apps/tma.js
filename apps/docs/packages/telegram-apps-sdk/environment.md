# Environment

This package is designed to be used only inside the Telegram application. Since non-Telegram
environments lack Telegram-specific traits, calling methods such
as [retrieveLaunchParams](launch-parameters.md#retrieving)
or [postEvent](methods-and-events.md#postevent) will lead to errors.

Nevertheless, the package provides the `mockTelegramEnv` function, which imitates the environment
provided by Telegram. It helps developers start developing applications even without creating a mini
app record in BotFather.

This function accepts launch parameters in a raw or parsed format. Here is an example:

```ts
import { mockTelegramEnv, parseInitData } from '@telegram-apps/sdk';

const initDataRaw = new URLSearchParams([
  ['user', JSON.stringify({
    id: 99281932,
    first_name: 'Andrew',
    last_name: 'Rogue',
    username: 'rogue',
    language_code: 'en',
    is_premium: true,
    allows_write_to_pm: true,
  })],
  ['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
  ['auth_date', '1716922846'],
  ['start_param', 'debug'],
  ['chat_type', 'sender'],
  ['chat_instance', '8428209589180549439'],
]).toString();

mockTelegramEnv({
  themeParams: {
    accentTextColor: '#6ab2f2',
    bgColor: '#17212b',
    buttonColor: '#5288c1',
    buttonTextColor: '#ffffff',
    destructiveTextColor: '#ec3942',
    headerBgColor: '#17212b',
    hintColor: '#708499',
    linkColor: '#6ab3f3',
    secondaryBgColor: '#232e3c',
    sectionBgColor: '#17212b',
    sectionHeaderTextColor: '#6ab3f3',
    subtitleTextColor: '#708499',
    textColor: '#f5f5f5',
  },
  initData: parseInitData(initDataRaw),
  initDataRaw,
  version: '7.2',
  platform: 'tdesktop',
});
```

::: warning
Note that this function only imitates Telegram environment behavior. It doesn't send any real
requests or perform actions that you will only see in the Telegram application.
:::