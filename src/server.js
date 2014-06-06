var restify = require('restify'),
    config = require('../config'),
    port = process.env.NODE_PORT || config.port;

//
// Credits
// https://github.com/dresende/node-orm2/blob/master/examples/anontxt/app/controllers/_helpers.js
//

function formatErrors(errorsIn) {
  var errors = {};
  var a, e;

  for (a = 0; a < errorsIn.length; a++) {
    e = errorsIn[a];

    errors[e.property] = errors[e.property] || [];
    errors[e.property].push(e.msg);
  }
  return errors;
}

function listFeeds(req, res, next) {
  req.models.feed.all(function(err, feeds) {
    if (err) {
      return next(err);
    }

    res.send(feeds);
    next();
  });
}

function getFeed(req, res, next) {
  req.models.feed.get(req.params.id, function(err, feed) {
    if (err) {
      return next(err);
    }

    res.send(feed);
    next();
  });
}

function createFeed(req, res, next) {
  req.models.feed.create(req.body, function(err, feed) {
    if (err) {
      if (Array.isArray(err)) {
        return res.send(200, {
          errors: formatErrors(err)
        });
      } else {
        return next(err);
      }
    }

    res.send(feed);
    next();
  });
}

function updateFeed(req, res, next) {
  req.models.feed.get(req.params.id, function(err, feed) {
    if (err) {
      if (Array.isArray(err)) {
        return res.send(200, {
          errors: formatErrors(err)
        });
      } else {
        return next(err);
      }
    }

    feed.save(req.body, function(err) {
      if (err) {
        return next(err);
      }

      res.send(feed);
      next();
    });
  });
}

function destroyFeed(req, res, next) {
  req.models.feed.get(req.params.id, function(err, feed) {
    if (err) {
      return next(err);
    }

    feed.remove(function(err) {
      if (err) {
        return next(err);
      }

      res.send(feed);
      next();
    });
  });
}

function listArticles(req, res, next) {
  var Article = req.models.article,
      page = req.query.page;

  Article.pages(function(err, pages) {
    if (page < 1) {
      page = 1;
    }

    if (page > pages) {
      page = pages;
    }

    Article.page(page).order("-published_at").run(function(err, articles) {
      if (err) {
        return next(err);
      }

      res.send(articles);
      next();
    });
  });
}

function getArticle(req, res, next) {
  req.models.article.get(req.params.id, function(err, article) {
    if (err) {
      return next(err);
    }

    res.send(article);
    next();
  });
}

function createServer(db) {
  var server = restify.createServer({
    name: 'dat-rss',
    version: '1.0.0'
  });

  server.pre(restify.pre.pause());
  server.pre(restify.pre.sanitizePath());
  server.pre(restify.pre.userAgentConnection());

  server.use(restify.CORS());
  server.use(restify.dateParser());
  server.use(restify.queryParser());
  server.use(restify.gzipResponse());
  server.use(restify.bodyParser());

  server.use(function(req, res, next) {
    req.models = db.models;
    next();
  });

  server.get('/feeds', listFeeds);
  server.head('/feeds', listFeeds);
  server.get('/feeds/:id', getFeed);
  server.head('/feeds/:id', getFeed);
  server.post('/feeds', createFeed);
  server.put('/feeds/:id', updateFeed);
  server.del('/feeds/:id', destroyFeed);

  server.get('/articles', listArticles);
  server.head('/articles', listArticles);
  server.get('/articles/:id', getArticle);
  server.head('/articles/:id', getArticle);

  server.get(/\/?.*/, restify.serveStatic({
    directory: './public',
    default: 'index.html'
  }));

  server.on('after', function(req, res, route, err) {
    var latency = Date.now() - req.time();

    console.log('%s %s %s %sms - %s', req.method, req.url, res.statusCode, latency, res.get('Content-Length'));
  });

  server.listen(port, function(err) {
    if (err) {
      throw err;
    }

    console.log('%s listening at %s', server.name, server.url);
  });
}

module.exports = createServer;
