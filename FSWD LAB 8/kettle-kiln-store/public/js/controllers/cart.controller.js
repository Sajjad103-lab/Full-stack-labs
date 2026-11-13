import { $ } from '../utils/dom.js';
import { money } from '../utils/format.js';
import { MAX_QTY } from '../config.js';
import { handleApiError } from '../utils/errors.js';
import { redirectToLogin } from '../utils/nav.js';
import { session } from '../services/session.service.js';
import { cartService } from '../services/cart.service.js';
import { emptyCart, cartRow, shippingText } from '../views/cart.view.js';

const PAGE = 'cart.html';

export async function cartController() {
  if (!session.isLoggedIn()) return redirectToLogin(PAGE);

  const box = $('#cartItems');
  const summary = $('#cartSummary');
  let cart = { items: [] };
  let busy = false;

  const render = () => {
    if (!cart.items.length) {
      box.innerHTML = emptyCart();
      summary.classList.add('d-none');
      return;
    }
    summary.classList.remove('d-none');
    box.innerHTML = cart.items.map(cartRow).join('');
    $('#sumSubtotal').textContent = money(cart.subtotal);
    $('#sumShipping').textContent = shippingText(cart);
    $('#sumTotal').textContent = money(cart.total);
    $('#freeNote').textContent = cart.freeShippingNote;
  };

  // Run one cart action at a time, then redraw with the server's answer.
  const run = async (action) => {
    if (busy) return;
    busy = true;
    try { cart = await action(); render(); }
    catch (err) { handleApiError(err, PAGE); }
    finally { busy = false; }
  };

  box.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const id = Number(btn.closest('.cart-row').dataset.id);
    const line = cart.items.find((i) => i.productId === id);
    if (!line) return;
    if (btn.dataset.act === 'inc') run(() => cartService.setQty(id, Math.min(line.qty + 1, MAX_QTY)));
    if (btn.dataset.act === 'dec') run(() => cartService.setQty(id, line.qty - 1)); // 0 removes the line
    if (btn.dataset.act === 'del') run(() => cartService.remove(id));
  });
  $('#clearCart').addEventListener('click', () => run(() => cartService.clear()));

  await run(() => cartService.get());
}
