const c = require('./products.controller');

module.exports = (router) => {
  router.get('/api/products', c.list);
  router.get('/api/products/:id', c.get);
};
