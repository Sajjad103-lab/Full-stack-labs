import { esc } from '../utils/dom.js';
import { stars } from '../utils/format.js';

export const reviewItem = (r) => `
  <div class="review">
    <span class="rating" aria-label="${r.rating} out of 5 stars">${stars(r.rating)}</span>
    <p>${esc(r.text)}</p>
    <small class="text-secondary">${esc(r.author)}</small>
  </div>`;
