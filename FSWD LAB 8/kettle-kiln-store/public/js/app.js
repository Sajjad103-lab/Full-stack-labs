/* Kettle & Kiln - front-end entry point (ES modules).
   Each page declares data-page="..." on <body>; we run its controller. */
import { renderNavbar } from './views/navbar.view.js';
import { homeController } from './controllers/home.controller.js';
import { signupController, loginController } from './controllers/auth.controller.js';
import { cartController } from './controllers/cart.controller.js';
import { checkoutController } from './controllers/checkout.controller.js';

const controllers = {
  home: homeController,
  signup: signupController,
  login: loginController,
  cart: cartController,
  checkout: checkoutController,
};

function start() {
  renderNavbar();
  controllers[document.body.dataset.page]?.();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
