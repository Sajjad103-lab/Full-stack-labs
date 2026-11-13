const Router = require('./core/router');

// Register every module's routes in one place.
const router = new Router();
router.get('/api/health', () => [200, { status: 'ok' }]);

require('./modules/auth/auth.routes')(router);
require('./modules/products/products.routes')(router);
require('./modules/reviews/reviews.routes')(router);
require('./modules/cart/cart.routes')(router);
require('./modules/orders/orders.routes')(router);

module.exports = router;
