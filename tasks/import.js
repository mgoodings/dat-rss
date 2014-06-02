var models = require('../models'),
    FeedImporter = require('../src/feed-importer');

models(function(err, db) {
  if (err) {
    throw err;
  }

  console.log('Importing articles from feeds...');

  FeedImporter(db).run(function(err, results) {
    if (err) {
      throw err;
    }

    var total = 0;
    for (var i = 0; i < results.length; i++) {
      total += results[i];
    }

    console.log(total + ' articles were imported.');

    db.close();
    console.log('Done!');
  });
});
