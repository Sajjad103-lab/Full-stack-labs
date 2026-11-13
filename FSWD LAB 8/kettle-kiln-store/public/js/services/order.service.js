import { http } from './http.js';

export const orderService = {
  place: (details) => http.post('/checkout', details),
  list: () => http.get('/orders'),
  get: (id) => http.get(`/orders/${encodeURIComponent(id)}`),
};
