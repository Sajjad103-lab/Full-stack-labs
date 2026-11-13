const HttpError = require('../../core/http-error');
const { emailOk } = require('../../utils/validators');

function validateSignup({ name, email, password, confirm }) {
  if (typeof name !== 'string' || name.trim().length < 2) throw new HttpError(400, 'Enter your name');
  if (!emailOk(email)) throw new HttpError(400, 'Enter a valid email address');
  if (typeof password !== 'string' || password.length < 6) throw new HttpError(400, 'Use at least 6 characters');
  if (confirm !== undefined && confirm !== password) throw new HttpError(400, 'Passwords do not match');
}

module.exports = { validateSignup };
