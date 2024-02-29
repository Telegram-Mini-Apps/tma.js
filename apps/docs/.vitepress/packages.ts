function prefixed(value: string): string {
  return `/packages${value}`;
}

export const packagesNavItem = {
  text: 'Packages',
  link: prefixed('/typescript/tma-js-sdk/about'),
};

export const packagesSidebar = {
  [prefixed('/')]: [
    {
      text: 'TypeScript',
      items: [
        {
          text: '@tma.js/sdk',
          link: prefixed('/typescript/tma-js-sdk/about'),
          items: [
            {
              text: 'Initialization',
              link: prefixed('/typescript/tma-js-sdk/init'),
            },
            {
              text: 'Methods and events',
              link: prefixed('/typescript/tma-js-sdk/methods-and-events'),
            },
            {
              text: 'Launch parameters',
              link: prefixed('/typescript/tma-js-sdk/launch-parameters'),
            },
            {
              text: 'Theme parameters',
              link: prefixed('/typescript/tma-js-sdk/theme-parameters'),
            },
            {
              text: 'Init data',
              collapsed: true,
              items: [
                {
                  text: 'About',
                  link: prefixed('/typescript/tma-js-sdk/init-data/about'),
                },
                {
                  text: 'InitData',
                  link: prefixed('/typescript/tma-js-sdk/init-data/init-data'),
                },
                {
                  text: 'Chat',
                  link: prefixed('/typescript/tma-js-sdk/init-data/chat'),
                },
                {
                  text: 'User',
                  link: prefixed('/typescript/tma-js-sdk/init-data/user'),
                },
              ],
            },
            {
              text: 'Navigation',
              link: prefixed('/typescript/tma-js-sdk/navigation'),
            },
            {
              text: 'Components',
              collapsed: true,
              items: [
                {
                  text: 'About components',
                  link: prefixed('/typescript/tma-js-sdk/components/about'),
                },
                {
                  text: 'BackButton',
                  link: prefixed('/typescript/tma-js-sdk/components/back-button'),
                },
                {
                  text: 'ClosingBehavior',
                  link: prefixed('/typescript/tma-js-sdk/components/closing-behavior'),
                },
                {
                  text: 'CloudStorage',
                  link: prefixed('/typescript/tma-js-sdk/components/cloud-storage'),
                },
                {
                  text: 'HapticFeedback',
                  link: prefixed('/typescript/tma-js-sdk/components/haptic-feedback'),
                },
                {
                  text: 'InitData',
                  link: prefixed('/typescript/tma-js-sdk/components/init-data'),
                },
                {
                  text: 'Invoice',
                  link: prefixed('/typescript/tma-js-sdk/components/invoice'),
                },
                {
                  text: 'MainButton',
                  link: prefixed('/typescript/tma-js-sdk/components/main-button'),
                },
                {
                  text: 'MiniApp',
                  link: prefixed('/typescript/tma-js-sdk/components/mini-app'),
                },
                {
                  text: 'Popup',
                  link: prefixed('/typescript/tma-js-sdk/components/popup'),
                },
                {
                  text: 'QRScanner',
                  link: prefixed('/typescript/tma-js-sdk/components/qr-scanner'),
                },
                {
                  text: 'SettingsButton',
                  link: prefixed('/typescript/tma-js-sdk/components/settings-button'),
                },
                {
                  text: 'ThemeParams',
                  link: prefixed('/typescript/tma-js-sdk/components/theme-params'),
                },
                {
                  text: 'Utils',
                  link: prefixed('/typescript/tma-js-sdk/components/utils'),
                },
                {
                  text: 'Viewport',
                  link: prefixed('/typescript/tma-js-sdk/components/viewport'),
                },
              ],
            },
          ],
        },
        { text: '@tma.js/sdk-react', link: prefixed('/typescript/tma-js-sdk-react') },
        { text: '@tma.js/sdk-solid', link: prefixed('/typescript/tma-js-sdk-solid') },
        { text: '@tma.js/sdk-vue', link: prefixed('/typescript/tma-js-sdk-vue') },
        {
          text: '@tma.js/solid-router-integration',
          link: prefixed('/typescript/tma-js-solid-router-integration'),
        },
      ],
    },
    {
      text: 'Node',
      items: [
        { text: '@tma.js/init-data-node', link: prefixed('/node/tma-js-init-data-node') },
      ],
    },
    {
      text: 'GoLang',
      items: [
        { text: 'init-data-golang', link: prefixed('/golang/init-data-golang') },
      ],
    },
    {
      text: 'Deprecated',
      items: [
        { text: '@tma.js/bridge', link: prefixed('/typescript/tma-js-bridge') },
        {
          text: '@tma.js/init-data',
          collapsed: true,
          items: [
            { text: 'About', link: prefixed('/typescript/tma-js-init-data/about') },
            { text: 'InitData', link: prefixed('/typescript/tma-js-init-data/init-data') },
            { text: 'Chat', link: prefixed('/typescript/tma-js-init-data/chat') },
            { text: 'User', link: prefixed('/typescript/tma-js-init-data/user') },
          ],
        },
        {
          text: '@tma.js/launch-params',
          link: prefixed('/typescript/tma-js-launch-params'),
        },
        { text: '@tma.js/theme-params', link: prefixed('/typescript/tma-js-theme-params') },
        { text: '@tma.js/navigation', link: prefixed('/typescript/tma-js-navigation') },
      ],
    },
  ],
};