const { db, save } = require('../../db/database');
const HttpError = require('../../core/http-error');
const { money } = require('../../utils/money');
const { FREE_SHIPPING_OVER, SHIPPING_FEE } = require('../../config');
const productsService = require('../products/products.service');

// Cart with line totals + summary (used by the cart and checkout pages)
function getCart(userId) {
  const items = (db.carts[userId] || []).flatMap((l) => {
    const p = productsService.findById(l.productId);
    if (!p) return []; // product was removed from the catalogue
    return [{ productId: l.productId, name: p.name, image: p.image, price: p.price, qty: l.qty, lineTotal: money(p.price * l.qty) }];
  });
  const subtotal = money(items.reduce((s, i) => s + i.lineTotal, 0));
  const free = items.length === 0 || subtotal >= FREE_SHIPPING_OVER;
  const shipping = free ? 0 : SHIPPING_FEE;
  return {
    items, subtotal, shipping, total: money(subtotal + shipping),
    freeShippingNote: free
      ? 'You get free shipping.'
      : `Add $${money(FREE_SHIPPING_OVER - subtotal)} more for free shipping.`,
  };
}

function addItem(userId, { productId, qty }) {
  if (!productsService.findById(productId)) throw new HttpError(404, 'Product not found');
  const cart = (db.carts[userId] ||= []);
  const line = cart.find((l) => l.productId === productId);
  if (line) line.qty += qty; else cart.push({ productId, qty });
  save();
  return getCart(userId);
}

function updateItem(userId, productId, qty) {
  const cart = db.carts[userId] || [];
  const line = cart.find((l) => l.productId === productId);
  if (!line) throw new HttpError(404, 'Item not in cart');
  if (qty === 0) db.carts[userId] = cart.filter((l) => l !== line); else line.qty = qty;
  save();
  return getCart(userId);
}

function removeItem(userId, productId) {
  const cart = db.carts[userId] || [];
  if (!cart.some((l) => l.productId === productId)) throw new HttpError(404, 'Item not in cart');
  db.carts[userId] = cart.filter((l) => l.productId !== productId);
  save();
  return getCart(userId);
}

// Empty in memory only (caller saves) - lets checkout save once, atomically.
const reset = (userId) => { db.carts[userId] = []; };

function clear(userId) {
  reset(userId);
  save();
  return getCart(userId);
}

module.exports = { getCart, addItem, updateItem, removeItem, reset, clear };
