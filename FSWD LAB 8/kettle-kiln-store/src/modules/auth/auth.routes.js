const c = require('./auth.controller');

module.exports = (router) => {
  router.post('/api/auth/signup', c.signup);
  router.post('/api/auth/login', c.login);
  router.post('/api/auth/logout', c.logout);
  router.get('/api/auth/me', c.me);
};
