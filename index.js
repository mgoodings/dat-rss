var models = require('./models'),
    server = require('./src/server');

models(function(err, db) {
  if (err) {
    throw err;
  }

  server(db);
});