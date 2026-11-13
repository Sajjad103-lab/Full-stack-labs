const HttpError = require('../../core/http-error');

function parseAddItem(b) {
  const qty = Number(b.qty ?? 1);
  if (!Number.isInteger(qty) || qty < 1) throw new HttpError(400, 'qty must be a whole number >= 1');
  return { productId: Number(b.productId), qty };
}

function parseUpdateQty(b) {
  const qty = Number(b.qty);
  if (!Number.isInteger(qty) || qty < 0) throw new HttpError(400, 'qty must be a whole number >= 0');
  return qty;
}
module.exports = { parseAddItem, parseUpdateQty };
