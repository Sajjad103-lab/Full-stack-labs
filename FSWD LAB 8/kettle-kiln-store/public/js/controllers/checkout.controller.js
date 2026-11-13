import { $ } from '../utils/dom.js';
import { money } from '../utils/format.js';
import { validate, withBusy } from '../utils/form.js';
import { handleApiError } from '../utils/errors.js';
import { redirectToLogin } from '../utils/nav.js';
import { session } from '../services/session.service.js';
import { cartService } from '../services/cart.service.js';
import { orderService } from '../services/order.service.js';
import { orderLine, shippingText } from '../views/cart.view.js';

const PAGE = 'checkout.html';

export async function checkoutController() {
  if (!session.isLoggedIn()) return redirectToLogin(PAGE);

  let cart;
  try { cart = await cartService.get(); }
  catch (err) { return handleApiError(err, PAGE); }
  if (!cart.items.length) { location.href = 'cart.html'; return; }

  const user = session.user();
  const form = $('#checkoutForm');
  form.name.value = user.name;
  form.email.value = user.email;

  $('#orderLines').innerHTML = cart.items.map(orderLine).join('');
  $('#sumSubtotal').textContent = money(cart.subtotal);
  $('#sumShipping').textContent = shippingText(cart);
  $('#sumTotal').textContent = money(cart.total);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    await withBusy(form.querySelector('[type=submit]'), async () => {
      try {
        const order = await orderService.place({
          name: form.name.value, email: form.email.value,
          address: form.address.value, city: form.city.value,
          postal: form.postal.value, payment: form.payment.value,
        });
        cartService.get().catch(() => {}); // server emptied the cart: refresh the badge
        $('#checkoutView').classList.add('d-none');
        $('#doneView').classList.remove('d-none');
        $('#orderId').textContent = order.id;
        $('#orderTotal').textContent = money(order.total);
        window.scrollTo({ top: 0 });
      } catch (err) { handleApiError(err, PAGE); }
    });
  });
}
