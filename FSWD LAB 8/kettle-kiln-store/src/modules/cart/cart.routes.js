const c = require('./cart.controller');

module.exports = (router) => {
  router.get('/api/cart', c.get);
  router.post('/api/cart/items', c.add);
  router.put('/api/cart/items/:productId', c.update);
  router.delete('/api/cart/items/:productId', c.remove);
  router.delete('/api/cart', c.clear);
};
