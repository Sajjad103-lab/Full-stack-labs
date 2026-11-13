const authService = require('./auth.service');
const { validateSignup } = require('./auth.validator');

module.exports = {
  signup: ({ body }) => {
    validateSignup(body);
    return [201, authService.signup(body)];
  },
  login: ({ body }) => [200, authService.login(body)],
  logout: ({ req }) => {
    authService.logout(authService.extractToken(req));
    return [200, { message: 'Logged out' }];
  },
  me: ({ user }) => [200, authService.publicUser(authService.requireUser(user))],
};
