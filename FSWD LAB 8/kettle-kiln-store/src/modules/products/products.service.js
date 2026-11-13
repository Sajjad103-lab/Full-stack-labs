const { db } = require('../../db/database');
const HttpError = require('../../core/http-error');

function list({ category, q } = {}) {
  let items = db.products;
  if (category && category !== 'All')
    items = items.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  if (q) items = items.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return items;
}

const findById = (id) => db.products.find((p) => p.id === Number(id)) || null;

function getById(id) {
  const product = findById(id);
  if (!product) throw new HttpError(404, 'Product not found');
  return product;
}

module.exports = { list, findById, getById };
