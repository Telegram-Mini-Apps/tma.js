import { sectionGen } from './utils';

const PREFIX = '/packages';

const section = sectionGen(PREFIX);

export const packagesNavItem = {
  text: 'Packages',
  link: `${PREFIX}/telegram-apps-sdk`,
};

export const packagesSidebar = {
  [PREFIX]: [
    section('CLI', {
      '@telegram-apps/create-mini-app': 'telegram-apps-create-mini-app',
    }),
    section('TypeScript', {
      '@telegram-apps/sdk': [
        'telegram-apps-sdk',
        {
          'Components': [
            'components',
            {
              BackButton: 'back-button',
              BiometryManager: 'biometry-manager',
              ClosingBehavior: 'closing-behavior',
              CloudStorage: 'cloud-storage',
              HapticFeedback: 'haptic-feedback',
              InitData: 'init-data',
              Invoice: 'invoice',
              MainButton: 'main-button',
              MiniApp: 'mini-app',
              Popup: 'popup',
              QRScanner: 'qr-scanner',
              SettingsButton: 'settings-button',
              ThemeParams: 'theme-params',
              Utils: 'utils',
              Viewport: 'viewport',
            },
            true,
          ],
          'Environment': 'environment',
          'Methods and Events': 'methods-and-events',
          'Launch Parameters': 'launch-parameters',
          'Theme Parameters': 'theme-parameters',
          'Init Data': [
            'init-data',
            {
              InitData: 'init-data',
              Chat: 'chat',
              User: 'user',
            },
            true,
          ],
          'Navigation': [
            'navigation',
            {
              BrowserNavigator: 'browser-navigator',
            },
            true
          ],
          'CSS Variables': 'css-variables',
        },
      ],
      '@telegram-apps/sdk-react': '/telegram-apps-sdk-react',
      '@telegram-apps/sdk-solid': '/telegram-apps-sdk-solid',
      '@telegram-apps/solid-router-integration': '/telegram-apps-solid-router-integration',
      '@telegram-apps/react-router-integration': '/telegram-apps-react-router-integration',
    }),
    section('Node', {
      '@telegram-apps/init-data-node': 'telegram-apps-init-data-node',
    }),
    section('GoLang', {
      'init-data-golang': 'init-data-golang',
    }),
  ],
};
