const cart = require('./cart.service');
const { requireUser } = require('../auth/auth.service');
const { parseAddItem, parseUpdateQty } = require('./cart.validator');

const userId = (ctx) => requireUser(ctx.user).id; // 401 if not logged in

module.exports = {
  get: (ctx) => [200, cart.getCart(userId(ctx))],
  add: (ctx) => [201, cart.addItem(userId(ctx), parseAddItem(ctx.body))],
  update: (ctx) =>
    [200, cart.updateItem(userId(ctx), Number(ctx.params.productId), parseUpdateQty(ctx.body))],
  remove: (ctx) => [200, cart.removeItem(userId(ctx), Number(ctx.params.productId))],
  clear: (ctx) => [200, cart.clear(userId(ctx))],
};
