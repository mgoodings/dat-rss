module.exports = function(orm, db) {
  var Article = db.define('article', {
    link: {
      type: 'text',
      required: true,
      unique: true
    },
    title: {
      type: 'text'
    },
    author: {
      type: 'text'
    },
    description: {
      type: 'text',
      big: true
    },
    published_at: {
      type: 'date',
      time: true
    },
    updated_at: {
      type: 'date',
      time: true
    },
    image: {
      type: 'text'
    }
  }, {
    timestamp: true,
    validations: {
      link: orm.enforce.unique("link is not unique")
    }
  });

  Article.hasOne('feed', db.models.feed, {
    required: true,
    reverse: 'articles'
  });
};
