import { $ } from './dom.js';

// Bootstrap validation helper: returns true when the form is valid.
export function validate(form) {
  form.classList.add('was-validated');
  return form.checkValidity();
}

export function showFormError(message) {
  const el = $('#formError');
  if (!el) return false;
  el.textContent = message;
  el.classList.remove('d-none');
  return true;
}

export const hideFormError = () => $('#formError')?.classList.add('d-none');

// Disable a button while an async action runs.
export async function withBusy(button, action) {
  if (button) button.disabled = true;
  try { return await action(); }
  finally { if (button) button.disabled = false; }
}
