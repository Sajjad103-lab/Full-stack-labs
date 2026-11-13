const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const router = require('./routes');
const { PUBLIC_DIR } = require('./config');
const { userFromRequest } = require('./modules/auth/auth.service');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
};

// Send a file from ./public. Returns true if one was sent.
function sendStaticFile(res, pathname) {
  const rel = pathname === '/' ? 'index.html' : pathname.slice(1);
  const file = path.join(PUBLIC_DIR, path.normalize(rel));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) return false;
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return false;
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
  return true;
}

function createApp() {
  return http.createServer(async (req, res) => {
    const reply = (code, body) => {
      res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(body));
    };

    // CORS, so pages from another origin can call the API during development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname.startsWith('/api/')) {
        const ctx = { req, url, params: {}, body: {}, user: userFromRequest(req) };
        const [code, data] = await router.handle(ctx);
        return reply(code, data);
      }
      if (req.method === 'GET' && sendStaticFile(res, url.pathname)) return;
      reply(404, { error: 'Route not found' });
    } catch (error) {
      reply(error.code || 500, { error: error.code ? error.message : 'Server error' });
      if (!error.code) console.error(error);
    }
  });
}

module.exports = { createApp };
