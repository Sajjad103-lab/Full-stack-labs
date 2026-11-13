import { http } from './http.js';

export const productService = {
  list(category = 'All') {
    const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return http.get('/products' + query);
  },
  get: (id) => http.get(`/products/${id}`),
};
