const crypto = require('node:crypto');
const { db, save } = require('../../db/database');
const HttpError = require('../../core/http-error');
const { emailOk } = require('../../utils/validators');

const hashPassword = (pw, salt = crypto.randomBytes(16).toString('hex')) =>
  ({ salt, hash: crypto.scryptSync(pw, salt, 32).toString('hex') });

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

function extractToken(req) {
  return (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
}

function createSession(user) {
  const token = crypto.randomBytes(24).toString('hex');
  db.sessions[token] = user.id;
  return token;
}

function userFromRequest(req) {
  const userId = db.sessions[extractToken(req)];
  return userId ? db.users.find((u) => u.id === userId) || null : null;
}

// Used by controllers of protected endpoints: returns the user or throws 401.
function requireUser(user) {
  if (!user) throw new HttpError(401, 'Please log in first');
  return user;
}

function signup({ name, email, password }) {
  if (db.users.some((u) => u.email === email.toLowerCase()))
    throw new HttpError(409, 'Email already registered');
  const { salt, hash } = hashPassword(password);
  const user = { id: db.nextIds.user++, name: name.trim(), email: email.toLowerCase(), salt, hash };
  db.users.push(user);
  const token = createSession(user);
  save();
  return { token, user: publicUser(user) };
}

function login({ email, password }) {
  const user = emailOk(email) && db.users.find((u) => u.email === email.toLowerCase());
  if (!user || typeof password !== 'string') throw new HttpError(401, 'Wrong email or password');
  const { hash } = hashPassword(password, user.salt);
  if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(user.hash)))
    throw new HttpError(401, 'Wrong email or password');
  const token = createSession(user);
  save();
  return { token, user: publicUser(user) };
}

function logout(token) {
  delete db.sessions[token];
  save();
}

module.exports = { publicUser, extractToken, userFromRequest, requireUser, signup, login, logout };
