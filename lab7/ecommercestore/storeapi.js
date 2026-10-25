// Kettle & Kiln e-commerce store - persistent REST API (Lab 3, Task 2)
// Plain node:http, no npm packages. Data is saved to data/db.json, so it
// survives server restarts (that is what makes the API "persistent").
// Run: node store-api.js      (Node.js 20+)

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const FREE_SHIPPING_OVER = 50;   // assumption: free shipping above this subtotal
const SHIPPING_FEE = 5;

// ---------- Persistent storage (JSON file) ----------
const seedProducts = [
  { id: 1, name: 'Jasmine Pearls',      category: 'Tea',     price: 14, description: 'Hand-rolled green tea scented with jasmine.' },
  { id: 2, name: 'Assam Breakfast',     category: 'Tea',     price: 11, description: 'Malty, bold black tea for mornings.' },
  { id: 3, name: 'Roasted Oolong',      category: 'Tea',     price: 16, description: 'Toasty, mineral oolong with a long finish.' },
  { id: 4, name: 'Sencha Reserve',      category: 'Tea',     price: 18, description: 'Fresh, grassy Japanese green tea.' },
  { id: 5, name: 'Stoneware Teapot',    category: 'Teaware', price: 48, description: 'Hand-finished 600ml teapot with steel infuser.' },
  { id: 6, name: 'Ceramic Cup Set',     category: 'Teaware', price: 32, description: 'Set of two glazed cups.' },
  { id: 7, name: 'Bamboo Tea Scoop',    category: 'Teaware', price: 9,  description: 'Carved bamboo measuring scoop.' },
  { id: 8, name: 'Cast Iron Kettle',    category: 'Teaware', price: 65, description: 'Enamelled 1L kettle that holds heat.' },
];

let db;
function loadDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } else {
    db = { users: [], sessions: {}, products: seedProducts, reviews: [], carts: {}, orders: [], nextIds: { user: 1, review: 1, order: 1 } };
    saveDb();
  }
}
function saveDb() { // write to a temp file then rename, so a crash never corrupts the db
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

// ---------- Helpers ----------
const hashPassword = (pw, salt = crypto.randomBytes(16).toString('hex')) =>
  ({ salt, hash: crypto.scryptSync(pw, salt, 32).toString('hex') });
const emailOk = (e) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const money = (n) => Math.round(n * 100) / 100;

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 1e6) req.destroy(); });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { reject(new HttpError(400, 'Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}
class HttpError extends Error { constructor(code, msg) { super(msg); this.code = code; } }

function currentUser(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const userId = db.sessions[token];
  return userId ? db.users.find((u) => u.id === userId) : null;
}
function requireUser(req) {
  const user = currentUser(req);
  if (!user) throw new HttpError(401, 'Please log in first');
  return user;
}
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

// Build the cart view with line totals + summary (used by cart and checkout pages)
function cartView(userId) {
  const raw = db.carts[userId] || [];
  const items = raw.map((l) => {
    const p = db.products.find((x) => x.id === l.productId);
    return { productId: l.productId, name: p.name, price: p.price, qty: l.qty, lineTotal: money(p.price * l.qty) };
  });
  const subtotal = money(items.reduce((s, i) => s + i.lineTotal, 0));
  const shipping = items.length === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  return {
    items, subtotal, shipping, total: money(subtotal + shipping),
    freeShippingNote: subtotal >= FREE_SHIPPING_OVER || items.length === 0
      ? 'You get free shipping.'
      : `Add $${money(FREE_SHIPPING_OVER - subtotal)} more for free shipping.`,
  };
}

// ---------- Route handlers ----------
// Each route: [method, regex, handler(req, params, url, body)] -> returns [status, data]
const routes = [];
const route = (method, pattern, handler) =>
  routes.push([method, new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), handler]);

route('GET', '/api/health', () => [200, { status: 'ok' }]);

// --- Auth (signup.html / login.html) ---
route('POST', '/api/auth/signup', (req, p, url, b) => {
  const { name, email, password, confirm } = b;
  if (typeof name !== 'string' || name.trim().length < 2) throw new HttpError(400, 'Enter your name');
  if (!emailOk(email)) throw new HttpError(400, 'Enter a valid email address');
  if (typeof password !== 'string' || password.length < 6) throw new HttpError(400, 'Use at least 6 characters');
  if (confirm !== undefined && confirm !== password) throw new HttpError(400, 'Passwords do not match');
  if (db.users.some((u) => u.email === email.toLowerCase())) throw new HttpError(409, 'Email already registered');
  const { salt, hash } = hashPassword(password);
  const user = { id: db.nextIds.user++, name: name.trim(), email: email.toLowerCase(), salt, hash };
  db.users.push(user);
  const token = crypto.randomBytes(24).toString('hex');
  db.sessions[token] = user.id;
  saveDb();
  return [201, { token, user: publicUser(user) }];
});

route('POST', '/api/auth/login', (req, p, url, b) => {
  const user = emailOk(b.email) && db.users.find((u) => u.email === b.email.toLowerCase());
  if (!user || typeof b.password !== 'string') throw new HttpError(401, 'Wrong email or password');
  const { hash } = hashPassword(b.password, user.salt);
  if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(user.hash)))
    throw new HttpError(401, 'Wrong email or password');
  const token = crypto.randomBytes(24).toString('hex');
  db.sessions[token] = user.id;
  saveDb();
  return [200, { token, user: publicUser(user) }];
});

route('POST', '/api/auth/logout', (req) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  delete db.sessions[token];
  saveDb();
  return [200, { message: 'Logged out' }];
});

route('GET', '/api/auth/me', (req) => [200, publicUser(requireUser(req))]);

// --- Products (index.html listing + filters) ---
route('GET', '/api/products', (req, p, url) => {
  const cat = url.searchParams.get('category');
  const q = (url.searchParams.get('q') || '').toLowerCase();
  let list = db.products;
  if (cat && cat !== 'All') list = list.filter((x) => x.category.toLowerCase() === cat.toLowerCase());
  if (q) list = list.filter((x) => x.name.toLowerCase().includes(q));
  return [200, list];
});
route('GET', '/api/products/:id', (req, p) => {
  const prod = db.products.find((x) => x.id === Number(p.id));
  if (!prod) throw new HttpError(404, 'Product not found');
  return [200, prod];
});

// --- Reviews (index.html reviews section) ---
route('GET', '/api/reviews', () => {
  const list = [...db.reviews].reverse();
  const avg = list.length ? money(list.reduce((s, r) => s + r.rating, 0) / list.length) : null;
  return [200, { average: avg, count: list.length, reviews: list }];
});
route('POST', '/api/reviews', (req, p, url, b) => {
  const rating = Number(b.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, 'Rating must be 1 to 5');
  if (typeof b.text !== 'string' || b.text.trim().length < 10) throw new HttpError(400, 'Write at least 10 characters');
  const user = currentUser(req);
  const review = { id: db.nextIds.review++, author: user ? user.name : 'Guest', rating, text: b.text.trim(), createdAt: new Date().toISOString() };
  db.reviews.push(review);
  saveDb();
  return [201, review];
});

// --- Cart (cart.html) - saved per user, so it persists across logins ---
route('GET', '/api/cart', (req) => [200, cartView(requireUser(req).id)]);

route('POST', '/api/cart/items', (req, p, url, b) => {
  const user = requireUser(req);
  const qty = Number(b.qty ?? 1);
  if (!Number.isInteger(qty) || qty < 1) throw new HttpError(400, 'qty must be a whole number >= 1');
  if (!db.products.some((x) => x.id === Number(b.productId))) throw new HttpError(404, 'Product not found');
  const cart = (db.carts[user.id] ||= []);
  const line = cart.find((l) => l.productId === Number(b.productId));
  if (line) line.qty += qty; else cart.push({ productId: Number(b.productId), qty });
  saveDb();
  return [201, cartView(user.id)];
});

route('PUT', '/api/cart/items/:productId', (req, p, url, b) => {
  const user = requireUser(req);
  const qty = Number(b.qty);
  if (!Number.isInteger(qty) || qty < 0) throw new HttpError(400, 'qty must be a whole number >= 0');
  const cart = db.carts[user.id] || [];
  const line = cart.find((l) => l.productId === Number(p.productId));
  if (!line) throw new HttpError(404, 'Item not in cart');
  if (qty === 0) db.carts[user.id] = cart.filter((l) => l !== line); else line.qty = qty;
  saveDb();
  return [200, cartView(user.id)];
});

route('DELETE', '/api/cart/items/:productId', (req, p) => {
  const user = requireUser(req);
  const cart = db.carts[user.id] || [];
  if (!cart.some((l) => l.productId === Number(p.productId))) throw new HttpError(404, 'Item not in cart');
  db.carts[user.id] = cart.filter((l) => l.productId !== Number(p.productId));
  saveDb();
  return [200, cartView(user.id)];
});

route('DELETE', '/api/cart', (req) => {
  const user = requireUser(req);
  db.carts[user.id] = [];
  saveDb();
  return [200, cartView(user.id)];
});

// --- Checkout + orders (checkout.html) ---
route('POST', '/api/checkout', (req, p, url, b) => {
  const user = requireUser(req);
  for (const f of ['name', 'email', 'address', 'city', 'postal', 'payment'])
    if (typeof b[f] !== 'string' || !b[f].trim()) throw new HttpError(400, `${f} is required`);
  if (!emailOk(b.email)) throw new HttpError(400, 'Enter a valid email');
  if (!/^[A-Za-z0-9 \-]{3,10}$/.test(b.postal)) throw new HttpError(400, 'Enter a valid postal code');
  if (!['cod', 'demo-card'].includes(b.payment)) throw new HttpError(400, 'Choose a valid payment method');
  const cart = cartView(user.id);
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
  db.carts[user.id] = [];          // empty the cart after ordering
  saveDb();
  return [201, order];
});

route('GET', '/api/orders', (req) => [200, db.orders.filter((o) => o.userId === requireUser(req).id).reverse()]);
route('GET', '/api/orders/:id', (req, p) => {
  const order = db.orders.find((o) => o.id === p.id && o.userId === requireUser(req).id);
  if (!order) throw new HttpError(404, 'Order not found');
  return [200, order];
});

// ---------- Server ----------
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const reply = (code, body) => {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body)); // objects must be turned into JSON text before res.end()
  };

  // CORS so the HTML pages can call the API from any origin during development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  try {
    if (url.pathname.startsWith('/api/')) {
      for (const [method, re, handler] of routes) {
        const m = url.pathname.match(re);
        if (m && req.method === method) {
          const body = ['POST', 'PUT', 'PATCH'].includes(method) ? await readJson(req) : {};
          const [code, data] = handler(req, m.groups || {}, url, body);
          return reply(code, data);
        }
      }
      const pathExists = routes.some(([, re]) => re.test(url.pathname));
      return reply(pathExists ? 405 : 404, { error: pathExists ? 'Method not allowed' : 'Route not found' });
    }

    // Optional: serve the front-end from ./public (index.html, css/, js/ ...)
    if (req.method === 'GET') {
      const rel = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      const file = path.join(__dirname, 'public', path.normalize(rel));
      if (file.startsWith(path.join(__dirname, 'public')) && fs.existsSync(file) && fs.statSync(file).isFile()) {
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
        return fs.createReadStream(file).pipe(res);
      }
    }
    reply(404, { error: 'Route not found' });
  } catch (error) {
    reply(error.code || 500, { error: error.code ? error.message : 'Server error' });
    if (!error.code) console.error(error);
  }
});

loadDb();
server.listen(PORT, () => console.log(`Store API on http://localhost:${PORT}/api/products`));
