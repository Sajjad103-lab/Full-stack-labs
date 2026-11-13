// Remembers the logged-in user + API token in localStorage.
const TOKEN_KEY = 'kk_token';
const USER_KEY = 'kk_user';

const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };

export const session = {
  token: () => read(TOKEN_KEY),
  user() { try { return JSON.parse(read(USER_KEY)); } catch { return null; } },
  isLoggedIn() { return Boolean(this.token() && this.user()); },
  save({ token, user }) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch { /* storage unavailable: user stays logged out */ }
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch { /* ignore */ }
  },
};
