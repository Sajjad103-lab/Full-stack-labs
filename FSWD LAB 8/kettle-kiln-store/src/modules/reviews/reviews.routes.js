const c = require('./reviews.controller');

module.exports = (router) => {
  router.get('/api/reviews', c.list);
  router.post('/api/reviews', c.create); // guests allowed
};
