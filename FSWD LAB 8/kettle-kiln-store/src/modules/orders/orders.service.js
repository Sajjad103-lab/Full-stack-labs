const { db, save } = require('../../db/database');
const HttpError = require('../../core/http-error');
const cartService = require('../cart/cart.service');

function checkout(user, b) {
  const cart = cartService.getCart(user.id);
  if (cart.items.length === 0) throw new HttpError(400, 'Your cart is empty');

  const order = {
    id: `KK-${String(db.nextIds.order++).padStart(5, '0')}`,
    userId: user.id,
    items: cart.items, subtotal: cart.subtotal, shipping: cart.shipping, total: cart.total,
    contact: { name: b.name.trim(), email: b.email.trim() },
    delivery: { address: b.address.trim(), city: b.city.trim(), postal: b.postal.trim() },
    payment: b.payment, status: 'Placed', createdAt: new Date().toISOString(),
  };
  db.orders.push(order);
  cartService.reset(user.id);
  save(); // one write: order + emptied cart
  return order;
}

const listForUser = (userId) => db.orders.filter((o) => o.userId === userId).reverse();

function getForUser(userId, orderId) {
  const order = db.orders.find((o) => o.id === orderId && o.userId === userId);
  if (!order) throw new HttpError(404, 'Order not found');
  return order;
}

module.exports = { checkout, listForUser, getForUser };
