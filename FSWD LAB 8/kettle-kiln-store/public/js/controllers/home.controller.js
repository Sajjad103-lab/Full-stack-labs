import { $, $$, esc } from '../utils/dom.js';
import { validate, withBusy } from '../utils/form.js';
import { handleApiError } from '../utils/errors.js';
import { toast } from '../views/toast.js';
import { productCard } from '../views/product.view.js';
import { reviewItem } from '../views/review.view.js';
import { session } from '../services/session.service.js';
import { productService } from '../services/product.service.js';
import { cartService } from '../services/cart.service.js';
import { reviewService } from '../services/review.service.js';

const NEXT = 'index.html#shop';

export async function homeController() {
  setupProducts();
  setupReviews();
}

/* ----- product grid, filters, add to cart ----- */
async function setupProducts() {
  const grid = $('#productGrid');

  const draw = async (category) => {
    try {
      const products = await productService.list(category);
      grid.innerHTML = products.length
        ? products.map(productCard).join('')
        : '<p class="text-secondary">No products found.</p>';
    } catch (err) {
      grid.innerHTML = `<p class="text-danger">${esc(err.message)}</p>`;
    }
  };

  $('#filters').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    $$('.filter-btn').forEach((x) => x.classList.toggle('active', x === btn));
    draw(btn.dataset.cat);
  });

  grid.addEventListener('click', async (e) => {
    const btn = e.target.closest('.add-btn');
    if (!btn) return;
    if (!session.isLoggedIn()) return handleApiError({ status: 401 }, NEXT);
    await withBusy(btn, async () => {
      try {
        await cartService.add(Number(btn.dataset.id));
        toast(`${btn.dataset.name} added to your cart`);
      } catch (err) { handleApiError(err, NEXT); }
    });
  });

  draw('All');
}

/* ----- reviews ----- */
async function setupReviews() {
  const list = $('#reviewList');

  const draw = async () => {
    try {
      const { reviews } = await reviewService.list();
      list.innerHTML = reviews.length
        ? reviews.map(reviewItem).join('')
        : '<p class="text-secondary">No reviews yet. Be the first!</p>';
    } catch (err) {
      list.innerHTML = `<p class="text-danger">${esc(err.message)}</p>`;
    }
  };
  draw();

  const form = $('#reviewForm');
  if (!session.isLoggedIn()) {
    form.outerHTML = `<p class="text-secondary">Want to share your own? <a href="login.html?next=index.html%23reviews">Log in</a> to write a review.</p>`;
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    await withBusy(form.querySelector('[type=submit]'), async () => {
      try {
        await reviewService.create({ rating: Number(form.rating.value), text: form.text.value.trim() });
        form.reset();
        form.classList.remove('was-validated');
        await draw();
        toast('Thanks, your review is live');
      } catch (err) { handleApiError(err, 'index.html#reviews'); }
    });
  });
}
