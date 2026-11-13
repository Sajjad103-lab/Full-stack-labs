const products = require('./products.service');

module.exports = {
  list: ({ url }) => [200, products.list({
    category: url.searchParams.get('category'),
    q: url.searchParams.get('q') || '',
  })],
  get: ({ params }) => [200, products.getById(params.id)],
};
