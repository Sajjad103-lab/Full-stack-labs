import { http } from './http.js';
import { session } from './session.service.js';

export const authService = {
  async signup({ name, email, password, confirm }) {
    const result = await http.post('/auth/signup', { name, email, password, confirm });
    session.save(result);
    return result.user;
  },
  async login({ email, password }) {
    const result = await http.post('/auth/login', { email, password });
    session.save(result);
    return result.user;
  },
  async logout() {
    try { await http.post('/auth/logout'); } catch { /* still log out locally */ }
    session.clear();
  },
};
