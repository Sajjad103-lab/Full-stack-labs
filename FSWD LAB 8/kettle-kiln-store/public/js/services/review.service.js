import { http } from './http.js';

export const reviewService = {
  list: () => http.get('/reviews'),                 // { average, count, reviews }
  create: ({ rating, text }) => http.post('/reviews', { rating, text }),
};
