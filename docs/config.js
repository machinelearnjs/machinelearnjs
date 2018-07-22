const extra = require('./extra.json');

module.exports = {
  title: 'Kalimdor.js',
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