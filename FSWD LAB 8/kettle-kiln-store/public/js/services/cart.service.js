import { http } from './http.js';

// Every change broadcasts "cart:changed" so the navbar badge stays in sync.
const publish = (cart) => {
  document.dispatchEvent(new CustomEvent('cart:changed', { detail: cart }));
  return cart;
};

export const cartService = {
  get: async () => publish(await http.get('/cart')),
  add: async (productId, qty = 1) => publish(await http.post('/cart/items', { productId, qty })),
  setQty: async (productId, qty) => publish(await http.put(`/cart/items/${productId}`, { qty })),
  remove: async (productId) => publish(await http.delete(`/cart/items/${productId}`)),
  clear: async () => publish(await http.delete('/cart')),
  count: (cart) => cart.items.reduce((n, i) => n + i.qty, 0),
};
