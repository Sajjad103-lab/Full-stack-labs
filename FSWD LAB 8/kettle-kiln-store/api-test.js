// Run: node server.js (in another terminal), then: node api-test.js
const BASE = 'http://localhost:3000/api';
let token = '';
async function call(method, path, body) {
  const r = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  console.log(`${method} ${path} -> ${r.status}`, JSON.stringify(data).slice(0, 160));
  return data;
}
(async () => {
  const email = `sara${Date.now()}@example.com`;
  await call('GET', '/products?category=Tea');
  const s = await call('POST', '/auth/signup', { name: 'Sara Khan', email, password: 'secret1', confirm: 'secret1' });
  token = s.token;
  await call('POST', '/auth/login', { email, password: 'wrong' });
  await call('POST', '/cart/items', { productId: 1, qty: 2 });
  await call('POST', '/cart/items', { productId: 5, qty: 1 });
  await call('PUT', '/cart/items/1', { qty: 3 });
  await call('GET', '/cart');
  await call('DELETE', '/cart/items/5');
  await call('POST', '/reviews', { rating: 5, text: 'Lovely jasmine tea, arrived fast.' });
  await call('GET', '/reviews');
  await call('POST', '/checkout', { name: 'Sara Khan', email, address: '12 Mall Rd', city: 'Rawalpindi', postal: '46000', payment: 'cod' });
  await call('GET', '/orders');
  await call('GET', '/cart');
})().catch((e) => console.error('Start the server first:', e.message));
