import type { DefaultTheme } from 'vitepress';

import { sectionGen } from './utils';

type Sidebar = DefaultTheme.Sidebar;
type NavItemWithLink = DefaultTheme.NavItemWithLink;

function feature(prefix: string, path: string, title?: string): [string, string] {
  title ||=
    path[0].toUpperCase() +
    path.slice(1).replace(/-./g, (m) => ' ' + m[1].toUpperCase());

  return [`${prefix}${title}`, path];
}

function component(path: string, title?: string): [string, string] {
  return feature('💠', path, title);
}

function utils(path: string, title?: string): [string, string] {
  return feature('⚙️', path, title);
}

export const packagesLinksGenerator = (prefix: string = '') => {
  const BASE = prefix + '/packages';

  const section = sectionGen(BASE);

  const packagesNavItem: NavItemWithLink = {
    text: 'Packages',
    link: `${BASE}/tma-js-signals`,
  };

  const packagesSidebar: Sidebar = {
    [BASE]: [
      section('TypeScript', {
        '@tma.js/signals': 'tma-js-signals',
        '@tma.js/bridge': ['tma-js-bridge', {
          'Methods': 'methods',
          'Events': 'events',
          'Launch Parameters': 'launch-parameters',
          'Environment': 'environment',
          'Globals': 'globals',
          'Advanced': 'advanced',
          'Functional Approach': 'functional-approach',
          'Migrating from telegram-apps': 'migrate-from-telegram-apps',
        }],
        '@tma.js/sdk': ['tma-js-sdk', {
          'Initializing': 'initializing',
          'Usage Tips': 'usage-tips',
          'Features': ['features', {
            ...Object.fromEntries([
              component('back-button'),
              component('biometry'),
              component('closing-behavior'),
              component('cloud-storage'),
              utils('emoji-status'),
              component('haptic-feedback'),
              utils('home-screen'),
              component('init-data'),
              component('invoice'),
              utils('links'),
              component('location-manager'),
              component('main-button'),
              component('mini-app'),
              component('popup'),
              utils('privacy'),
              component('qr-scanner', 'QR Scanner'),
              component('secondary-button'),
              component('settings-button'),
              component('swipe-behavior'),
              component('theme-params'),
              utils('uncategorized'),
              component('viewport'),
            ]),
          }],
          'Migrating from telegram-apps': 'migrate-from-telegram-apps',
        }],
        '@tma.js/sdk-react': 'tma-js-sdk-react',
        '@tma.js/sdk-svelte': 'tma-js-sdk-svelte',
        '@tma.js/sdk-vue': 'tma-js-sdk-vue',
        '@tma.js/sdk-solid': 'tma-js-sdk-solid',
      }),
      section('Node', {
        '@tma.js/init-data-node': ['tma-js-init-data-node', {
          'Parsing': 'parsing',
          'Validating': 'validating',
          'Signing': 'signing',
          'Functional Approach': 'functional-approach',
          'Migrating from telegram-apps': 'migrate-from-telegram-apps',
        }],
      }),
      section('CLI', { '@tma.js/create-mini-app': 'tma-js-create-mini-app' }),
      section('GoLang', { 'init-data-golang': 'init-data-golang' }),
    ],
  };

  return {
    packagesNavItem,
    packagesSidebar,
  };
};
