import { $, esc } from '../utils/dom.js';
import { session } from '../services/session.service.js';
import { authService } from '../services/auth.service.js';
import { cartService } from '../services/cart.service.js';

const setBadge = (n) => { const b = $('#cartBadge'); if (b) b.textContent = n; };

export function renderNavbar() {
  const user = session.user();
  const authLinks = session.isLoggedIn()
    ? `<li class="nav-item"><span class="nav-link">Hi, ${esc(user.name.split(' ')[0])}</span></li>
       <li class="nav-item"><a class="nav-link" href="#" id="logoutLink">Log out</a></li>`
    : `<li class="nav-item"><a class="nav-link" href="login.html">Log in</a></li>
       <li class="nav-item"><a class="btn btn-leaf btn-sm ms-lg-2" href="signup.html">Sign up</a></li>`;

  $('#navbar').innerHTML = `
  <nav class="navbar navbar-expand-lg kk-nav sticky-top">
    <div class="container">
      <a class="brand navbar-brand" href="index.html">Kettle &amp; Kiln</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav ms-auto align-items-lg-center">
          <li class="nav-item"><a class="nav-link" href="index.html#shop">Shop</a></li>
          <li class="nav-item"><a class="nav-link" href="index.html#reviews">Reviews</a></li>
          <li class="nav-item"><a class="nav-link" href="cart.html">Cart <span class="badge rounded-pill cart-badge" id="cartBadge">0</span></a></li>
          ${authLinks}
        </ul>
      </div>
    </div>
  </nav>`;

  $('#logoutLink')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await authService.logout();
    location.href = 'index.html';
  });

  // Badge follows every cart change; load the saved cart once for logged-in users.
  document.addEventListener('cart:changed', (e) => setBadge(cartService.count(e.detail)));
  if (session.isLoggedIn()) {
    cartService.get().catch((err) => {
      if (err.status === 401) location.reload(); // login expired: session was cleared, redraw as guest
    });
  }
}
