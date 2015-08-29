(function(moment, Vue) {
  var QUOTE_RE = /^'.*'$/;

  function stripQuotes(str) {
    if (QUOTE_RE.test(str)) {
      return str.slice(1, -1)
    }
  }

  var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function() {
      callback(JSON.parse(xhr.responseText));
    };
    xhr.send();
  };

  var FeedViewer = new Vue({
    el: '#feed_viewer',
    data: {
      filterFeedId: null,
      feeds: [],
      articles: []
    },
    filters: {
      humanDate: function(date) {
        return moment(date).fromNow();
      },
      date: function(date, fmt) {
        var fmt = stripQuotes(fmt) || this.$get(fmt) || 'DD/MM/YYYY';
        return moment(date).format(fmt);
      }
    },
    created: function() {
      this.fetchFeeds();

      this.$watch('filterFeedId', function() {
        this.fetchArticles();
      });
    },
    methods: {
      fetchFeeds: function() {
        var self = this;
        getJSON('/feeds', function(result) {
          self.feeds = result;
        });
      },
      fetchArticles: function() {
        var self = this,
          url = self.filterFeedId ? ('/feeds/' + self.filterFeedId + '/articles') : '/articles';
        getJSON(url, function(result) {
          self.articles = result;
        });
      }
    }
  });
}(moment, Vue));
