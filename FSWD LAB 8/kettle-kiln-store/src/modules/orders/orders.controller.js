const orders = require('./orders.service');
const { requireUser } = require('../auth/auth.service');
const { validateCheckout } = require('./orders.validator');

module.exports = {
  checkout: (ctx) => {
    const user = requireUser(ctx.user);
    validateCheckout(ctx.body);
    return [201, orders.checkout(user, ctx.body)];
  },
  list: (ctx) => [200, orders.listForUser(requireUser(ctx.user).id)],
  get: (ctx) => [200, orders.getForUser(requireUser(ctx.user).id, ctx.params.id)],
};
