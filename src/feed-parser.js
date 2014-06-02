var debug = require('debug')('FeedParser'),
    request = require('request'),
    FeedParser = require('feedparser');

function FeedReader(url) {
  if (!(this instanceof FeedReader)) {
    return new FeedReader(url);
  }

  debug('ctor');

  this.url = url;
  this.items = [];
}

FeedReader.prototype = {
  parse: function(callback) {
    var that = this,
        parser = new FeedParser();

    debug('parse');

    parser.on('error', callback);
    parser.on('end', callback.bind(null, null, this.items));
    parser.on('readable', function() {
      that.handleReadable(this);
    });

    request(this.url).pipe(parser);
  },

  handleReadable: function(stream) {
    var item;

    debug('handleReadable');

    while (item = stream.read()) {
      this.items.push(item);
    }
  }
};

module.exports = FeedReader;
