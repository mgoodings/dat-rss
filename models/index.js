var orm = require('orm'),
  timestamps = require('orm-timestamps'),
  config = require('../config'),
  connection = null;

function setup(db, callback) {
  require('./feed')(orm, db);
  require('./article')(orm, db);

  return callback(null, db);
}

module.exports = function(callback) {
  if (connection) {
    return callback(null, connection);
  }

  orm.connect(config.db, function(err, db) {
    if (err) {
      return callback(err);
    }

    connection = db;

    db.settings.set('instance.returnAllErrors', true);
    db.use(timestamps);

    setup(db, callback);
  });
};
