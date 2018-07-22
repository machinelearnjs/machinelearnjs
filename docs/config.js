const extra = require('./extra.json');

module.exports = {
  title: 'Kalimdor.js',
  locales: {
    '/': {
      lang: 'en-US',
      title: '',
      description: 'Machine Learning library for the web and Node.'
    }
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API', link: '/api/' }
    ],
    sidebar: {
      '/api/': extra.apiSidebar
    }
  }
}