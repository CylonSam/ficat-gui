const { bookshelf } = require('../db')

module.exports = bookshelf.Model.extend({
  tableName: 'catalogCards',
  hasTimestamps: true
})