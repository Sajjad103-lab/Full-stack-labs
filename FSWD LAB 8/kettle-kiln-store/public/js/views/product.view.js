import { esc } from '../utils/dom.js';
import { money, stars } from '../utils/format.js';
import { presentationFor } from '../data/product-presentation.js';
import { productImage } from './product-image.js';

export function productCard(p) {
  const v = presentationFor(p);
  return `
  <div class="col-6 col-lg-3">
    <article class="product-card">
      <div class="product-art" style="background:${v.tone}">${productImage(p, v)}</div>
      <div class="product-body">
        <span class="product-cat">${esc(p.category)}</span>
        <h3 class="product-title">${esc(p.name)}</h3>
        <span class="rating" aria-label="${v.rating} out of 5 stars">${stars(v.rating)}</span>
        <p class="small text-secondary mt-1">${esc(p.description)}</p>
        <div class="d-flex justify-content-between align-items-center mt-auto pt-2">
          <span class="price">${money(p.price)}</span>
          <button class="btn btn-leaf btn-sm add-btn" data-id="${p.id}" data-name="${esc(p.name)}">Add to cart</button>
        </div>
      </div>
    </article>
  </div>`;
}
