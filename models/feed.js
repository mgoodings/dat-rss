module.exports = function(orm, db) {
  var Feed = db.define('feed', {
    url: { type: 'text', required: true, unique: true },
    title: { type: 'text' }
  }, {
    timestamp: true,
    validations: {
      url: orm.enforce.unique("is not unique")
    }
  });
};
