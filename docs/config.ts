import { webpackBundler } from '@vuepress/bundler-webpack';
import { defaultTheme } from '@vuepress/theme-default';
import { defineUserConfig } from 'vuepress';
const apiExtra = require('./apiExtra.json');
const exampleExtra = require('./exampleExtra.json');

export default defineUserConfig({
  title: 'machinelearn.js',
  locales: {
    '/': {
      lang: 'en-US',
      title: '',
      description: 'Machine Learning library for the web and Node.',
    },
  },
  head: [
    ['link', { rel: 'icon', href: `/logo.png` }],
    ['link', { rel: 'manifest', href: '/manifest.json' }],
    ['meta', { name: 'theme-color', content: '#0079cc' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['link', { rel: 'apple-touch-icon', href: `/icons/apple-touch-icon-152x152.png` }],
    ['meta', { name: 'msapplication-TileImage', content: '/icons/msapplication-icon-144x144.png' }],
    ['meta', { name: 'msapplication-TileColor', content: '#000000' }],
  ],
  bundler: webpackBundler(),
  theme: defaultTheme({
    navbar: [
      { text: 'Home', link: '/' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
      { text: 'Github', link: 'https://github.com/machinelearnjs/machinelearnjs' },
    ],
    sidebar: {
      '/api/': apiExtra.apiSidebar,
      '/examples/': exampleExtra.exampleSidebar,
    },
  }),
});
