import { esc } from '../utils/dom.js';
import { productArt } from './product-art.js';

// Real picture when the API gives one, otherwise the small drawn icon.
export function productImage(item, look) {
  return item.image
    ? `<img src="${esc(item.image)}" alt="${esc(item.name)}" loading="lazy">`
    : productArt(look);
}
