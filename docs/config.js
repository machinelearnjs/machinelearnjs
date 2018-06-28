const extra = require('./extra.json');

module.exports = {
  themeConfig: {
    nav: [
      { text: 'Another page', link: '/hello.html' },
      { text: 'API', link: '/api/' }
    ],
    sidebar: {
      '/api/': extra.apiSidebar
    }
  }
}