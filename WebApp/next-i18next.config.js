const path = require('path')

module.exports = {
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en', // default locale will fallback to 'en'
    localePath: path.resolve('./public/locales'),
  },
}
