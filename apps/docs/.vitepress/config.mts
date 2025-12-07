import { defineConfig } from 'vitepress';

import { packagesLinksGenerator } from './packages';
import { platformLinksGenerator } from './platform';

const { packagesNavItem, packagesSidebar } = packagesLinksGenerator();
const { platformNavItem, platformSidebar } = platformLinksGenerator();

function padSlashes(value: string = ''): string {
  if (!value.startsWith('/')) {
    value = `/${value}`;
  }
  return value.endsWith('/') ? value : `${value}/`;
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Telegram Mini Apps',
  description: 'Documentation covering all aspects of Telegram platform - Telegram Mini Apps.',
  // The base URL the site will be deployed at.
  // https://vitepress.dev/reference/site-config#base
  base: padSlashes(process.env.DOCS_BASE_URL),
  ignoreDeadLinks: true,
  // Internationalization.
  // https://vitepress.dev/guide/i18n
  locales: {
    root: { label: 'English', lang: 'en' },
  },
  // Show when each page content was last updated.
  // https://vitepress.dev/reference/default-theme-last-updated#last-updated
  lastUpdated: true,
  // We don't want .html to be in the end of each route.
  // https://vitepress.dev/guide/routing#generating-clean-url
  cleanUrls: true,
  // Enable sitemap generation.
  // https://vitepress.dev/guide/sitemap-generation#sitemap-generation
  sitemap: { hostname: 'https://docs.telegram-mini-apps.com' },
  // Configure <head/>.
  // https://vitepress.dev/reference/site-config#head
  head: [
    // Add favicon.
    // https://vitepress.dev/reference/site-config#example-adding-a-favicon
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    // Add Mixpanel analytics:
    // https://docs.mixpanel.com/docs/quickstart/connect-your-data?sdk=javascript
    ['script', { async: '', src: '/analytics.js' }],
  ],
  // https://vitepress.dev/reference/default-theme-config
  themeConfig: {
    logo: '/logo.db0268ac.png',
    // https://vitepress.dev/reference/default-theme-footer#footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2022-present Vladislav Kibenko and Contributors',
    },
    editLink: {
      text: 'Edit this page on GitHub',
      pattern: 'https://github.com/telegram-mini-apps/tma.js/edit/master/apps/docs/:path',
    },
    nav: [
      { text: 'Home', link: '/' },
      platformNavItem,
      packagesNavItem,
    ],
    // https://vitepress.dev/reference/default-theme-sidebar
    sidebar: {
      ...packagesSidebar,
      ...platformSidebar,
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/telegram-mini-apps' }],
    search: { provider: 'local' },
    // search: {
    //   provider: 'algolia',
    //   options: {
    //     apiKey: '2d6f370231694c71de2955f974e54986',
    //     appId: 'QRZA56E4H6',
    //     indexName: 'telegram-mini-apps',
    //     insights: true,
    //   },
    // },
  },
  transformPageData(pageData, { siteConfig }) {
    const {
      frontmatter,
      filePath,
      title,
      description,
      lastUpdated,
    } = pageData;
    const {
      site: {
        title: siteTitle,
        base,
        lang,
      },
      sitemap: {
        hostname = '',
      } = {},
    } = siteConfig;
    const isHome = frontmatter.layout === 'home';
    const siteBase = `${hostname}${base}`;
    frontmatter.head ??= [];

    const addMeta = (property: string, content: string) => frontmatter.head.push([
      'meta', { property, content },
    ]);

    const addOg = (prop: string, content: string) => addMeta(`og:${prop}`, content);

    addOg('title', isHome ? siteTitle : `${title} | ${siteTitle}`);
    addOg('site_name', 'Telegram Mini Apps Platform Documentation');
    addOg('image', `${siteBase}thumbnail-1200x630.6b8f54aa217a6baed4703ad5af866677.png`);
    addOg('image:width', '1200');
    addOg('image:height', '630');
    addOg('image:type', 'image/png');
    addOg('locale', lang.replace(/-/, '_'));

    // To make it correctly display in Telegram.
    addMeta('twitter:card', 'summary_large_image');

    if (description) {
      addOg('description', description);
    }

    if (isHome) {
      addOg('url', siteBase);
      addOg('type', 'website');
    } else {
      addOg('url', `${siteBase}${filePath.replace(/\.md$/, '')}`);
      addOg('type', 'article');
      if (lastUpdated) {
        addMeta('article:modified_time', new Date(lastUpdated).toISOString());
      }
    }
  },
  transformHtml(code) {
    // To make meta tags work properly, we should add specific prefixes to html tag.
    const prefix = [
      ['og', 'https://ogp.me/ns#'],
      ['article', 'https://ogp.me/article#'],
      ['website', 'https://ogp.me/ns/website#'],
    ]
      .map(line => line.join(': '))
      .join('\n');

    return code.replace(/<html /, `<html prefix="${prefix}" `);
  },
});
