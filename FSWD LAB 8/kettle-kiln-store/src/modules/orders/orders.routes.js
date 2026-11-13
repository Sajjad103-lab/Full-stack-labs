const c = require('./orders.controller');

module.exports = (router) => {
  router.post('/api/checkout', c.checkout);
  router.get('/api/orders', c.list);
  router.get('/api/orders/:id', c.get);
};
