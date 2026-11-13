import { esc } from '../utils/dom.js';
import { money } from '../utils/format.js';
import { presentationFor } from '../data/product-presentation.js';
import { productImage } from './product-image.js';

export const emptyCart = () => `
  <div class="empty"><h2 class="h4">Your cart is empty</h2>
  <p class="text-secondary">Add a tin of tea to get started.</p>
  <a class="btn btn-leaf" href="index.html#shop">Browse the shop</a></div>`;

export function cartRow(line) {
  const v = presentationFor(line);
  return `
  <div class="cart-row" data-id="${line.productId}">
    <div class="cart-thumb" style="background:${v.tone}">${productImage(line, v)}</div>
    <div><h3 class="h6 mb-1">${esc(line.name)}</h3><span class="text-secondary small">${money(line.price)} each</span></div>
    <div class="cart-end d-flex align-items-center gap-3 justify-content-between">
      <div class="qty" role="group" aria-label="Quantity for ${esc(line.name)}">
        <button data-act="dec" aria-label="Decrease quantity">−</button><span>${line.qty}</span><button data-act="inc" aria-label="Increase quantity">+</button>
      </div>
      <strong>${money(line.lineTotal)}</strong>
      <button class="btn btn-link text-danger p-0" data-act="del">Remove</button>
    </div>
  </div>`;
}

export const orderLine = (line) =>
  `<div class="d-flex justify-content-between small mb-2"><span>${esc(line.name)} × ${line.qty}</span><span>${money(line.lineTotal)}</span></div>`;

export const shippingText = (cart) => (cart.shipping ? money(cart.shipping) : 'Free');
