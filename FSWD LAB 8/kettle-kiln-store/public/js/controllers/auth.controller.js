import { $ } from '../utils/dom.js';
import { validate, showFormError, hideFormError, withBusy } from '../utils/form.js';
import { authService } from '../services/auth.service.js';

export function signupController() {
  const form = $('#signupForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const confirm = form.confirm;
    confirm.setCustomValidity(form.password.value === confirm.value ? '' : 'Passwords do not match');
    if (!validate(form)) return;
    hideFormError();
    await withBusy(form.querySelector('[type=submit]'), async () => {
      try {
        await authService.signup({
          name: form.name.value.trim(),
          email: form.email.value.trim(),
          password: form.password.value,
          confirm: confirm.value,
        });
        location.href = 'index.html';
      } catch (err) { showFormError(err.message); }
    });
  });

  form.confirm.addEventListener('input', () => form.confirm.setCustomValidity(''));
}

export function loginController() {
  const form = $('#loginForm');
  const next = new URLSearchParams(location.search).get('next') || 'index.html';
  // only allow same-site relative redirects
  const safeNext = /^[\w\-./#%]+$/.test(next) && !next.startsWith('//') ? next : 'index.html';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    hideFormError();
    await withBusy(form.querySelector('[type=submit]'), async () => {
      try {
        await authService.login({ email: form.email.value.trim(), password: form.password.value });
        location.href = safeNext;
      } catch (err) { showFormError(err.message); }
    });
  });
}
