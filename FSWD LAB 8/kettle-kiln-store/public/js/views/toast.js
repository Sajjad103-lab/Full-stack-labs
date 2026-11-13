import { $, esc } from '../utils/dom.js';

export function toast(msg) {
  let wrap = $('#toastWrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toastWrap';
    wrap.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = 'toast align-items-center text-bg-dark border-0';
  el.setAttribute('role', 'status');
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${esc(msg)}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
  wrap.appendChild(el);
  const t = new bootstrap.Toast(el, { delay: 2200 }); // bootstrap = global from the CDN bundle
  el.addEventListener('hidden.bs.toast', () => el.remove());
  t.show();
}
