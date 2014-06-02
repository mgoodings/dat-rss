module.exports = function(orm, db) {
  var Feed = db.define('feed', {
    url: { type: 'text', required: true, unqiue: true },
    title: { type: 'text' }
  }, {
    timestamp: true
  });
};
