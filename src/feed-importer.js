var debug = require('debug')('FeedImporter'),
    async = require('async'),
    FeedParser = require('./feed-parser');

function FeedImporter(db) {
  if (!(this instanceof FeedImporter)) {
    return new FeedImporter(db);
  }

  debug('ctor');

  this.db = db;
}

FeedImporter.prototype = {
  run: function(callback) {
    debug('run');

    async.waterfall(
      [
        this.findAllFeeds.bind(this),
        this.iterateFeeds.bind(this)
      ],
      callback
    );
  },

  findAllFeeds: function(callback) {
    var Feed = this.db.models.feed;

    debug('findAllFeeds');

    Feed.all(callback);
  },

  iterateFeeds: function(feeds, callback) {
    debug('iterateFeeds');

    async.map(
      feeds,
      this.handleEachFeed.bind(this),
      callback
    );
  },

  handleEachFeed: function(feed, callback) {
    debug('handleEachFeed', feed.id, feed.url);

    feed.articles = [];

    async.waterfall(
      [
        this.parseFeed.bind(this, feed),
        this.handleParsedFeed.bind(this, feed),
        this.updateFeed.bind(this, feed)
      ],
      function(err) {
        if (!err) {
          callback(null, feed.articles.length);
        } else {
          callback(err);
        }
      }
    );
  },

  parseFeed: function(feed, callback) {
    debug('parseFeed', feed.id, feed.url);

    FeedParser(feed.url).parse(callback);
  },

  handleParsedFeed: function(feed, items, callback) {
    debug('handleParsedFeed', feed.id, feed.url);

    async.each(
      items,
      this.mapFeedItem.bind(this, feed),
      callback
    );
  },

  updateFeed: function(feed, callback) {
    debug('updateFeed', feed.id, feed.url);

    feed.save(callback);
  },

  mapFeedItem: function(feed, item, callback) {
    debug('mapFeedItem', feed.id, item.title);

    feed.title = item.meta && item.meta.title;

    async.waterfall(
      [
        this.matchToArticle.bind(this, feed, item),
        this.mapArticle.bind(this, feed, item)
      ],
      callback
    );
  },

  matchToArticle: function(feed, item, callback) {
    debug('matchToArticle', feed.id, item.title);

    var Article = this.db.models.article;

    Article.exists({
      link: item.link
    }, callback);
  },

  mapArticle: function(feed, item, exists, callback) {
    debug('mapArticle', feed.id, exists, item.title);

    if (!exists) {
      var article = {};

      article.link = item.link;
      article.title = item.title;
      article.author = item.author;
      article.summary = item.summary;
      article.description = item.description;
      article.published_at = new Date(item.pubDate);
      article.updated_at = new Date(item.date);
      article.image = item.image && item.image.url;

      feed.articles.push(article);
    }

    callback(null);
  }
};

module.exports = FeedImporter;
