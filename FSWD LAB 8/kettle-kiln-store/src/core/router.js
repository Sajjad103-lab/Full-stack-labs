const HttpError = require('./http-error');
const { readJson } = require('./body');

const BODY_METHODS = ['POST', 'PUT', 'PATCH'];

// Tiny router. A handler receives ctx = { req, url, params, body, user }
// and returns [statusCode, data]. Handlers throw HttpError to fail.
class Router {
  constructor() { this.routes = []; }

  add(method, pattern, handler) {
    const regex = new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$');
    this.routes.push({ method, regex, handler });
  }
  get(p, h)    { this.add('GET', p, h); }
  post(p, h)   { this.add('POST', p, h); }
  put(p, h)    { this.add('PUT', p, h); }
  delete(p, h) { this.add('DELETE', p, h); }

  async handle(ctx) {
    let pathMatched = false;
    for (const route of this.routes) {
      const match = ctx.url.pathname.match(route.regex);
      if (!match) continue;
      pathMatched = true;
      if (route.method !== ctx.req.method) continue;

      ctx.params = match.groups || {};
      ctx.body = BODY_METHODS.includes(route.method) ? await readJson(ctx.req) : {};
      return route.handler(ctx);
    }
    throw new HttpError(pathMatched ? 405 : 404, pathMatched ? 'Method not allowed' : 'Route not found');
  }
}

module.exports = Router;
